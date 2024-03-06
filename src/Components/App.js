import { useEffect, useReducer } from 'react'

import Header from './Header'
import Main from './Main'
import Loader from './Loader'
import Error from './Error'
import StartScreen from './StartScreen'
import Question from './Question'
import NextButton from './NextButton'
import Progress from './Progress'
import FinishedScreen from './FinishedScreen'
import Footer from './Footer'
import Timer from './Timer'

const SEC_PER_QUESTION = 30

// Reducer Hook Initial State
const initialState = {
  questions: [],

  // Loading, error, ready, active, finished
  status: 'loading',

  // Track questions in "questions" array
  index: 0,

  // Track every question option select 
  answer: null,

  // track user points after answer each question
  points: 0,

  // Highscore
  highscore: 0,

  // Timer
  SecondsRemaining: null
}


// Main switch reducer function 
function reducer(state, action) {
  switch (action.type) {
    // CASE READY
    case 'dataRecived':
      return {
        ...state,
        questions: action.payload,
        status: 'ready'
      }
    // CASE FAILED
    case 'dataFailed':
      return {
        ...state,
        status: 'error'
      }
    // CASE ACTIVE
    case 'start':
      return {
        ...state,
        status: 'active',
        SecondsRemaining: state.questions.length * SEC_PER_QUESTION
      }

    // CASE NEW ANSWER 
    case 'newAnswer':
      const question = state.questions.at(state.index)

      return {
        ...state,
        answer: action.payload,
        points: action.payload === question.correctOption ? state.points + question.points : state.points
      }

    // CASE NEXT QUESTION
    case 'nextQuestion':

      return {
        ...state,
        index: state.index + 1,
        answer: null
      }


    // CASE FINISH QUIZ
    case 'finish':

      return {
        ...state,
        status: 'finished',
        highscore: state.points > state.highscore ? state.points : state.highscore
      }

    // CASE RESTART QUIZ
    case 'restart':

      return {
        ...initialState, questions: state.questions, status: 'ready'
      }

    case 'tick':
      return {
        ...state,
        SecondsRemaining: state.SecondsRemaining - 1,
        status: state.SecondsRemaining === 0 ? 'finished' : state.status
      }

    default:
      throw new Error('Action Unkhown')
  }
}

export default function App() {

  // Reducer STATE
  const [{ questions, status, index, answer, points, highscore, SecondsRemaining }, dispatch] = useReducer(reducer, initialState)


  // Drived States
  const numQuestions = questions.length
  const maxPossiblePoints = questions.reduce((prev, cur) => prev + cur.points, 0)


  // Fetch API
  useEffect(function () {
    // Fetch
    fetch('http://localhost:9000/questions')
      // Convert
      .then(res => res.json())
      // setReducer with dispatch
      .then(data => dispatch({ type: 'dataRecived', payload: data }))
      // Handle errors
      .catch(err => dispatch({ type: 'dataFailed' }))
  }, [])


  return (
    <div className="app">
      <Header />

      <Main >
        {status === 'loading' && <Loader />}
        {status === 'error' && <Error />}
        {status === 'ready' && <StartScreen dispatch={dispatch} numQuestions={numQuestions} />}

        {status === 'active' && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />

            <Question
              dispatch={dispatch}
              answer={answer}
              question={questions[index]}
            />
            <Footer>
              <Timer
                dispatch={dispatch}
                SecondsRemaining={SecondsRemaining}
              />
              <NextButton
                answer={answer}
                dispatch={dispatch}
                numQuestions={numQuestions}
                index={index}
              />
            </Footer>
          </>
        )}
        {status === 'finished' && <FinishedScreen
          points={points}
          maxPossiblePoints={maxPossiblePoints}
          highscore={highscore}
          dispatch={dispatch}
        />}
      </Main>
    </div>
  )
}