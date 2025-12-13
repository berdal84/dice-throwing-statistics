import { useMemo, useState } from 'react'
import './App.css'
import Button from '@mui/material/Button';
import { Undo } from '@mui/icons-material';
import Container from '@mui/material/Container';
import Plot from 'react-plotly.js';
import { Box, Grid, Paper } from '@mui/material';

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
    <Container maxWidth="md" sx={{ width: '100vw', margin: 0 }}>
      <h1>Dice Roll Statistics</h1>
      <h2>Register a new result</h2>
      <p>Press a number to add a new dice roll result to the history.</p>
      <Box sx={{ display: 'flex', gap: "2px", justifyContent: 'center', flexWrap: 'wrap' }}>
        {VALUES.map((value, index) =>
              <Button
                key={index}               
                variant='contained'
                onClick={() => setHistory([...history, value])}
                >
                  {value}
              </Button>
           )
        }
      </Box>
      
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
      <Box>
      <Plot
        style={{ width: '100%', height: '100%'}}
        data={[{
          y: VALUES,
          x: THEORETICAL_PROBABILITIES,
          text: THEORETICAL_PROBABILITIES.map( x => `${Math.round(x*100)}%`),
          type: 'bar',
          marker: { color: '#d2d2d2ff' },
          name: 'theoretical',
          visible: "legendonly",
          orientation: "h",
        }, {
          y: VALUES,
          x: probabilities,
          text: probabilities.map( x => `${Math.round(x*100)}%`),
          type: 'bar',
          mode: 'lines+markers',
          marker: { color: '#3283e7ff' },
          name: 'current game',
          orientation: "h",
        }]}
        layout={{          
          legend: {
            xanchor: "right",
            bgcolor: "rgba(255,255,255,0.5)",
          },
          //autosize: true,
          margin: {
            pad: 0,
            //b: 0,
            t: 0,
            //l: 20,
            r: 0
          },
          yaxis: {
            title: {
              text: "Dice Roll Result"
            },
            tickvals: VALUES,
            ticks: 'outside'
          },
          xaxis: {
            title: {
              text: "Probabilities"
            },
            linewidth: 1,
            ticks: 'outside'            
          }}}
          config={{
            displayModeBar: false,
            responsive: true
          }}
      />
      </Box>
  </Container></>
}

export default App
