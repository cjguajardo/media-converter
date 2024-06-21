export default async function checkVerifier (url, token) {
  return new Promise((resolve, _) => {
    console.log('Verifying token', `${url}?token=${token}`)
    fetch(`${url}?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      // body: JSON.stringify({ token })
    }).then(response => {
      if (response && response.status === 200) {
        response.json().then(response_json => {
          console.log({ response_json })
          if (response_json) {
            resolve(response_json)
          } else { resolve(false) }
        }).catch(err => {
          console.log({ err })
          resolve(false)
        })
      } else { resolve(false) }
    }).catch(err => {
      console.log({ err })
      resolve(false)
    })
  })
}