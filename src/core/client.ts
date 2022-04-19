/**
 * This file was copied from https://github.com/windicss/vite-plugin-windicss/blob/main/packages/vite-plugin-windicss/src/client.ts
 */

/**
https://github.com/windicss/vite-plugin-windicss/blob/main/LICENSE

MIT License

Copyright (c) 2020 Anthony Fu<https://github.com/antfu>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function post(data: any) {
  return fetch('__POST_PATH__', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

function include<T>(set: Set<T>, v: T[] | Set<T>) {
  for (const i of v)
    set.add(i)
}

// eslint-disable-next-line no-console
console.log(
  '%c[windicss] devtools support enabled %c\nread more at https://windicss.org',
  'background:#0ea5e9; color:white; padding: 1px 4px; border-radius: 3px;',
  '',
)

const visitedClasses = new Set()
const pendingClasses = new Set()

let _timer: number | undefined

function schedule() {
  if (_timer != null)
    clearTimeout(_timer)
  _timer = setTimeout(() => {
    if (pendingClasses.size) {
      post({ type: 'add-classes', data: Array.from(pendingClasses) })
      include(visitedClasses, pendingClasses)
      pendingClasses.clear()
    }
  }, 10) as any
}

const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class' && mutation.target) {
      Array.from((mutation.target as Element).classList || [])
        .forEach((i) => {
          if (!visitedClasses.has(i))
            pendingClasses.add(i)
        })
      schedule()
    }
  })
})

mutationObserver.observe(document.documentElement || document.body, {
  childList: true,
  subtree: true,
  attributes: true,
})
