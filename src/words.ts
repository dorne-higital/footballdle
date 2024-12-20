const defaultMessage = ' Using word of the day instead.'

export function getWordOfTheDay() {
  if (location.search) {
    try {
      const query = atob(location.search.slice(1))
      if (query.length !== 5) {
        alert(`Incorrect word length from encoded query. ${defaultMessage}`)
      } else {
        return query
      }
    } catch (e) {
      alert(`Malformed encoded word query. ${defaultMessage}`)
    }
  }

  const now = new Date()
  const start = new Date(2022, 0, 0)
  const diff = Number(now) - Number(start)
  let day = Math.floor(diff / (1000 * 60 * 60 * 24))
  while (day > answers.length) {
    day -= answers.length
  }
  return answers[day]
}

 // 24/25 players 6 letters
const answers = [
  'vieira',
  'timber',
  'kiwior',
  'saliba',
  'thomas',
  'merino',
  'heaven',
  'bailey',
  'dobbin',
  'kamara',
  'mcginn',
  'ramsey',
  'rogers',
  'aarons',
  'brooks',
  'faivre',
  'kerkez',
  'mepham',
  'philip',
  'senesi',
  'araujo',
  'dennis',
  'hickey',
  'janelt',
  'jensen',
  'mbeumo',
  'onyeka',
  'schade',
  'thiago',
  'yogane',
  'baleba',
  'dahoud',
  'enciso',
  'mazilu',
  'milner',
  'minteh',
  'mitoma',
  'offiah',
  'steele',
  'cahill',
  'deivid',
  'disasi',
  'lukaku',
  'mudryk',
  'nkunku',
  'palmer',
  'fofana',
  'sancho',
  'hughes',
  'kamada',
  'mateta',
  'turner',
  'rodney',
  'kporha',
  'garner',
  'maupay',
  'mcneil',
  'ndiaye',
  'nelson',
  'bassey',
  'harris',
  'lukiƒa',
  'wilson',
  'cuenca',
  'clarke',
  'ladapo',
  'luongo',
  'taylor',
  'walton',
  'clarke',
  'ogbene',
  'cannon',
  'justin',
  'marcal',
  'thomas',
  'fatawu',
  'nelson',
  'becker',
  'darwin',
  'morton',
  'virgil',
  'chiesa',
  'davies',
  'akanji',
  'carson',
  'mcatee',
  'stones',
  'walker',
  'wright',
  'antony',
  'heaton',
  'mainoo',
  'ugarte',
  'murphy',
  'barnes',
  'botman',
  'gordon',
  'hayden',
  'murphy',
  'krafth',
  'tonali',
  'wilson',
  'bowler',
  'miguel',
  'danilo',
  'dennis',
  'elanga',
  'morato',
  'archer',
  'fraser',
  'bazunu',
  'edozie',
  'larios',
  'lumley',
  'taylor',
  'cornet',
  'downes',
  'austin',
  'davies',
  'devine',
  'romero',
  'spence',
  'udogie',
  'werner',
  'areola',
  'coufal',
  'earthy',
  'kilman',
  'aguerd',
  'irving',
  'todibo',
  'traore',
  'cundle',
  'dawson',
  'fraser',
  'guedes',
  'hoever',
  'semedo',
]
const allowedGuesses = [
  'vieira',
  'timber',
  'kiwior',
  'saliba',
  'thomas',
  'merino',
  'heaven',
  'bailey',
  'dobbin',
  'kamara',
  'mcginn',
  'ramsey',
  'rogers',
  'aarons',
  'brooks',
  'faivre',
  'kerkez',
  'mepham',
  'philip',
  'senesi',
  'araujo',
  'dennis',
  'hickey',
  'janelt',
  'jensen',
  'mbeumo',
  'onyeka',
  'schade',
  'thiago',
  'yogane',
  'baleba',
  'dahoud',
  'enciso',
  'mazilu',
  'milner',
  'minteh',
  'mitoma',
  'offiah',
  'steele',
  'cahill',
  'deivid',
  'disasi',
  'lukaku',
  'mudryk',
  'nkunku',
  'palmer',
  'fofana',
  'sancho',
  'hughes',
  'kamada',
  'mateta',
  'turner',
  'rodney',
  'kporha',
  'garner',
  'maupay',
  'mcneil',
  'ndiaye',
  'nelson',
  'bassey',
  'harris',
  'lukiƒa',
  'wilson',
  'cuenca',
  'clarke',
  'ladapo',
  'luongo',
  'taylor',
  'walton',
  'clarke',
  'ogbene',
  'cannon',
  'justin',
  'marcal',
  'thomas',
  'fatawu',
  'nelson',
  'becker',
  'darwin',
  'morton',
  'virgil',
  'chiesa',
  'davies',
  'akanji',
  'carson',
  'mcatee',
  'stones',
  'walker',
  'wright',
  'antony',
  'heaton',
  'mainoo',
  'ugarte',
  'murphy',
  'barnes',
  'botman',
  'gordon',
  'hayden',
  'murphy',
  'krafth',
  'tonali',
  'wilson',
  'bowler',
  'miguel',
  'danilo',
  'dennis',
  'elanga',
  'morato',
  'archer',
  'fraser',
  'bazunu',
  'edozie',
  'larios',
  'lumley',
  'taylor',
  'cornet',
  'downes',
  'austin',
  'davies',
  'devine',
  'romero',
  'spence',
  'udogie',
  'werner',
  'areola',
  'coufal',
  'earthy',
  'kilman',
  'aguerd',
  'irving',
  'todibo',
  'traore',
  'cundle',
  'dawson',
  'fraser',
  'guedes',
  'hoever',
  'semedo',
]

export const allWords = [...answers, ...allowedGuesses]
