import xs, {Stream} from 'xstream';
import {run} from '@cycle/xstream-run';
import {h, VNode, makeDOMDriver} from '@cycle/dom';
import Item from './Item';
import elementify from './elementify';
import List from './List';
import {DOMSource} from '@cycle/dom/xstream-typings';

interface Sources {
  DOM: DOMSource;
}

interface Sinks {
  DOM: Stream<VNode>;
}

function main(sources: Sources): Sinks {
  return List(sources);
}

run(main, {
  DOM: makeDOMDriver('#main-container')
});
