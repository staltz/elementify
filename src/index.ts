import xs, {Stream} from 'xstream';
import {run} from '@cycle/xstream-run';
import {h, VNode, makeDOMDriver} from '@cycle/dom';
import Item from './Item';
import elementify from './elementify';
import List from './NewList';
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

// const item = elementify(Item);

// function main() {
//   return {
//     DOM: xs.of(
//       h('div.hello', [
//         item('.foo', { attrs: { color: 'yellow', width: 400 } })
//       ])
//     )
//   }
// }

run(main, {
  DOM: makeDOMDriver('#main-container')
});
