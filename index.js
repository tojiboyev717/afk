require('./keep_alive') // Serverni jonli ushlab turadi

// 1.js, 2.js va 6.js fayllarini har 5 sekundda qayta ishga tushirish
setInterval(() => {
  try {
    delete require.cache[require.resolve('./1')]
    require('./1')
    console.log('1.js qayta ishga tushdi')
  } catch (err) {
    console.error('1.js yuklashda xatolik:', err.message)
  }

  try {
    delete require.cache[require.resolve('./2')]
    require('./2')
    console.log('2.js qayta ishga tushdi')
  } catch (err) {
    console.error('2.js yuklashda xatolik:', err.message)
  }

  try {
    delete require.cache[require.resolve('./6')]
    require('./6')
    console.log('6.js qayta ishga tushdi')
  } catch (err) {
    console.error('6.js yuklashda xatolik:', err.message)
  }
}, 5000) // Har 5 sekundda qayta ishlaydi
