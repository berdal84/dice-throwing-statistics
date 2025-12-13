import { useMemo, useState } from 'react'
import './App.css'
import Button from '@mui/material/Button';
import { UndoRounded } from '@mui/icons-material';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Plot from 'react-plotly.js';

const VALUES = [2,3,4,5,6,7,8,9,10,11,12]

function App()
{
  const [history, setHistory] = useState<number[]>([])

  const probabilities = useMemo(() => {
    const count = new Array(VALUES.length)
    count.fill(0)

    history.forEach( (value) => count[value-VALUES[0]] += 1 ) // count each number
    count.forEach( (_, i) => count[i] /= history.length ) // normalize
  
    console.log(count)
    return count
  }, [history])

  return <>
    <Container>
      <Stack direction="column">
      <h1>Dice Throwing Statistics</h1>
      <h2>Register a Dice Throw Result</h2>
      <Stack direction="row" flexWrap="wrap" gap={0.5} height="3rem">
        {VALUES.map(
          value => (
            <Button
              key={`value_${value}`}
              variant='contained'
              onClick={() => setHistory([...history, value])}
              >
                {value}
              </Button>
           ))
        }
      </Stack>
      
      <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{marginTop: 1}}>
        <p>History: ...{history.slice(-10).join(", ") }</p>
        <Button
          variant='text'
          disabled={history.length === 0}
          onClick={() => setHistory(history.toSpliced(history.length-1, 1))}
          >
          <UndoRounded></UndoRounded> UNDO
        </Button>
        
      </Stack>

      <h3>Live Statistics</h3>
      <Plot
        data={[{
          x: VALUES,
          y: probabilities,
          text: probabilities.map( x => `${Math.round(x*100)}%`),
          type: 'bar',
          mode: 'lines+markers',
          marker: { color: '#325ce7ff' }
        }]}
        layout={{
          title: { text: 'Simple Plot'},
          autosize: true,
          xaxis: {
            title: {
              text: "Dice Throw Result"
            }
          },
          yaxis: {
            range: history.length === 0 ? [0,1] : undefined,
            title: {
              text: "Probabilities"
            }
          }
        }}
      />
      </Stack>
  </Container></>
}

export default App
