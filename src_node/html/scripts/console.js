const log = console.log.bind(console)
// console replacement/interception
console.log = (...args) => {
  dom_logger(...args)
  log(...args)
}
console.error = (...args) => {
  dom_logger(...args)
  log(...args)
}


document.addEventListener('DOMContentLoaded', () => {
  // setInterval(() => { window.location.reload() }, 500)
})

function dom_logger (...args) {
  const console_log = document.querySelector('#console_log')
  for (const arg of args) {
    const pre = document.createElement('pre')
    pre.style.fontSize = 'small'
    if (arg instanceof Error) {
      pre.textContent = arg.stack
      pre.style.color = 'red'
    } else {
      pre.textContent = JSON.stringify(arg, null, 2)
    }
    console_log.appendChild(pre)
  }
}