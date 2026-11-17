const sig = 'create_populate_categories_jokes'

export function up(db) {
  const migrationAlreadyUpStmt = db.prepare('SELECT * FROM migrations WHERE signature=?')
  const migrationAlreadyUp = migrationAlreadyUpStmt.get(sig)
  migrationAlreadyUpStmt.close()

  if (migrationAlreadyUp) {
    throw new Error('The migration has already been ran')
  }

  console.log('=== CREATE TABLES ===')

  db.exec('CREATE TABLE categories (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL)')
  db.exec('CREATE TABLE jokes (id INTEGER PRIMARY KEY NOT NULL, category_id INTEGER NOT NULL, joke TEXT NOT NULL, response TEXT NOT NULL)')

  console.log('CREATED')
  console.log('=== INSERT categories ===')

  const categories = ['funnyJokes', 'lameJokes']
  const insertCategoriesStatement = db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)')
  for (let index = 0; index < categories.length; ++index) {
    insertCategoriesStatement.run(index + 1, categories[index])
  }
  insertCategoriesStatement.close()

  console.log(`INSERTED ${categories.length}`)
  console.log('=== INSERT jokes ===')

  const funnyJokes = [
    {
      'joke': 'Dlaczego komputer poszedł do lekarza?',
      'response': 'Bo złapał wirusa!'
    },
    {
      'joke': 'Dlaczego komputer nie może być głodny?',
      'response': 'Bo ma pełen dysk!'
    },
    {
      'joke': 'Co mówi jeden bit do drugiego?',
      'response': '„Trzymaj się, zaraz się przestawiamy!”'
    }
  ]
  const lameJokes = [
    {
      'joke': 'Dlaczego programiści preferują noc?',
      'response': 'Bo w nocy jest mniej bugów do łapania!'
    },
    {
      'joke': 'Jak nazywa się bardzo szybki programista?',
      'response': 'Błyskawiczny kompilator!'
    }
  ]
  const insertJokesStatement = db.prepare('INSERT INTO jokes (id, category_id, joke, response) VALUES (?, ?, ?, ?)')
  let index = 0, jndex = 0;
  for (; index < funnyJokes.length; ++index) {
    insertJokesStatement.run(index + 1, 1, funnyJokes[index].joke, funnyJokes[index].response)
  }
  for (; jndex < lameJokes.length; ++jndex) {
    insertJokesStatement.run(++index, 2, lameJokes[jndex].joke, lameJokes[jndex].response)
  }
  insertJokesStatement.close()

  console.log(`INSERTED ${index}`)

  const migrationUpStmt = db.prepare('INSERT INTO migrations (signature, timestamp) VALUES (?, ?)')
  migrationUpStmt.run(sig, Date.now()/1000)
  migrationUpStmt.close()
}

export function down(db) {
  db.exec('DROP TABLE IF EXISTS jokes')
  db.exec('DROP TABLE IF EXISTS categories')

  const migrationDownStmt = db.prepare('DELETE FROM migrations WHERE signature=?')
  migrationDownStmt.run(sig)
  migrationDownStmt.close()
}