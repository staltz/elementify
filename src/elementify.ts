import xs, {Stream, Listener} from 'xstream';
import {VNode, h, makeDOMDriver} from '@cycle/dom';
import Cycle from '@cycle/xstream-run';
import {DOMSource} from '@cycle/dom/xstream-typings';

export interface RequiredSources {
  DOM: DOMSource;
}

export interface RequiredSinks {
  DOM: Stream<VNode>;
}

export type CycleExec = {
  sources: RequiredSources;
  sinks: RequiredSinks;
  run: () => () => {};
}

export type Component = (sources: RequiredSources) => RequiredSinks;

export type HyperscriptFn = (sel?: string, data?: Object) => VNode;

function createDispatcherForSink(eventName: string, element: Element): Listener<any> {
  return {
    next: (detail: any) => {
      const event = document.createEvent('Event');
      event.initEvent(eventName, true, true);
      event['detail'] = detail;

      // const event = new CustomEvent(eventName, { detail });

      element.dispatchEvent(event);
    },
    error: () => { },
    complete: () => { },
  }
}

function createDispatcherForAllSinks(sinks: Object): Listener<Element> {
  return {
    next: (element: Element) => {
      for (let key in sinks) {
        if ((sinks as Object).hasOwnProperty(key) && key !== 'DOM') {
          sinks[key].removeListener(sinks[key]._elementifyListener);
          sinks[key]._elementifyListener = createDispatcherForSink(key, element);
          sinks[key].addListener(sinks[key]._elementifyListener);
        }
      }
    },
    error: () => { },
    complete: () => { },
  };
}

export interface ElementMonkeyPatched {
  _elementifyProps$: Stream<any>;
  _elementifyDispose: () => {};
}

export default function elementify(component: Component): HyperscriptFn {
  return function (sel?: string, data?: any): VNode {
    return h(`section${sel}`, {
      key: data.key,
      hook: {
        insert(vnode: VNode) {
          const element = (vnode.elm as Element & ElementMonkeyPatched);
          element._elementifyProps$ = xs.create<any>();
          const {sources, sinks, run} = Cycle(component, {
            DOM: makeDOMDriver(element),
            props: () => element._elementifyProps$
          }) as CycleExec;
          sources.DOM.elements().addListener(createDispatcherForAllSinks(sinks));
          element._elementifyDispose = run();
          if (data && data.attrs) {
            element._elementifyProps$.shamefullySendNext(data.attrs);
          }
        },
        update(old: VNode, vnode: VNode) {
          if (data && data.attrs) {
            const element = (vnode.elm as Element & ElementMonkeyPatched);
            element._elementifyProps$.shamefullySendNext(data.attrs);
          }
        },
        destroy(vnode: VNode) {
          const element = (vnode.elm as Element & ElementMonkeyPatched);
          element._elementifyDispose();
        }
      }
    })
  }
}