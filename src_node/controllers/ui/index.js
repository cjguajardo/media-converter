
export default {
  index: (_, res) => {
    return res.status(200).json({ message: 'Server is running' })
  },
  test: (_, res) => {
    return res.sendFile(`/app/html/test.html`)
  },
  login: (_, res) => {
    return res.sendFile(`/app/html/login.html`)
  }
}