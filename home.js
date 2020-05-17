var app = require('express')()
const PORT = process.env.PORT || 3000

app.get('/', (req,res) => {
  res.send('Bot Is Up')
})

app.listen(PORT, ()=>{
  console.log(`Bot is Up and health_check is on port ${PORT}`)
})