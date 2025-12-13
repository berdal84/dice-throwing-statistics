import { useMemo, useState } from 'react'
import './App.css'
import Button from '@mui/material/Button';
import { Undo } from '@mui/icons-material';
import Container from '@mui/material/Container';
import Plot from 'react-plotly.js';
import { Box, Grid } from '@mui/material';

const VALUES = [2,3,4,5,6,7,8,9,10,11,12]
const THEORETICAL_PROBABILITIES = [1,2,3,4,5,6,5,4,3,2,1].map( v => (v / 36) )

function App()
{
  const [history, setHistory] = useState<number[]>([])

  const probabilities = useMemo(() => {
    const count = new Array(VALUES.length)
    count.fill(0)

    history.forEach( (value) => count[value-VALUES[0]] += 1 ) // count each number
    
    if (history.length > 0) {
      count.forEach( (_, i) => count[i] /= history.length ) // normalize
    }
  
    console.log(count)
    return count
  }, [history])

  return <>
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        alignItems: "start"
      }}>
      <h1>Dice Roll Statistics</h1>
      <h2>Register a new result</h2>
      <p>Press a number to add a new dice roll result to the history.</p>
      <Grid container spacing={1} columnSpacing={1}>
        {VALUES.map((value, index) =>
            <Grid key={index} size={2}>
              <Button               
                variant='contained'
                onClick={() => setHistory([...history, value])}
                >
                  {value}
              </Button>
            </Grid>
           )
        }
      </Grid>
      
      <Box sx={{ display: 'flex', flexDirection: 'row-reverse', gap: 1, marginTop: 2}}>
        <Button
          variant='text'
          disabled={history.length === 0}
          onClick={() => setHistory(history.toSpliced(history.length-1, 1))}
          >
          <Undo/> UNDO
        </Button>

        <p>History: ...{history.slice(-10).join(", ") }</p> 
      </Box>

      <h2>Statistics</h2>
      <Plot
        data={[{
          x: VALUES,
          y: THEORETICAL_PROBABILITIES,
          text: THEORETICAL_PROBABILITIES.map( x => `${Math.round(x*100)}%`),
          type: 'bar',
          marker: { color: '#d2d2d2ff' },
          name: 'theoretical'
        }, {
          x: VALUES,
          y: probabilities,
          text: probabilities.map( x => `${Math.round(x*100)}%`),
          type: 'bar',
          mode: 'lines+markers',
          marker: { color: '#3283e7ff' },
          name: 'current game'
        }]}
        layout={{
          title: { text: 'Dice Roll Result Probabilities'},
          legend: {
            x: 0
          },
          autosize: true,
          xaxis: {
            title: {
              text: "Dice Roll Result"
            }
          },
          yaxis: {
            title: {
              text: "Probabilities"
            }
          }
        }}
      />
  </Container></>
}

export default App
