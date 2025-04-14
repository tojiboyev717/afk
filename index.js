require('./keep_alive') // Serverni jonli ushlab turadi

// 1,2 va 6 har 5 sekundda qayta ishga tushiriladi
setInterval(() => {
  try {
    delete require.cache[require.resolve('./1')]
    require('./1')
  } catch (err) {
  }

  try {
    delete require.cache[require.resolve('./2')]
    require('./2')
  } catch (err) {
  }
}, 5000) // 5 sekundda bir qayta yuklanadi

try {
    delete require.cache[require.resolve('./6')]
    require('./6')
  } catch (err) {
  }
}, 5000) // 5 sekundda bir qayta yuklanadi
