import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import Button from '@mui/material/Button';
import {DeleteForeverOutlined, Undo } from '@mui/icons-material';
import Container from '@mui/material/Container';
import Plot from 'react-plotly.js';
import { Box } from '@mui/material';

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
  
    return count
  }, [history])


  const load = () => {
    const raw_data = sessionStorage.getItem('data');
    const data = raw_data ? JSON.parse(raw_data) : null;
    if (!data) {
      console.warn("data cannot be found in sessionStorage")
    }
    setHistory(data)
  }

  const save = () => {
    sessionStorage.setItem('data', JSON.stringify(history));
    console.log("data saved to sessionStorage")
  }

  const historyAppend = useCallback((value: number) => {
    setHistory([...history, value])
    save()
  }, [history])

  const historyRemove = useCallback( (pos: number) => {
    setHistory( history.toSpliced(pos, 1) )
    save()
  }, [history])

  const historyClear = useCallback( () => {
    setHistory([])
  }, [history])

  // Init
  useEffect(() => {
    load()
  }, [])

  return <>
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', width: '100vw', margin: 0 }}>
      <h1>Dice Roll Statistics</h1>
      <h2>Register a new result</h2>
      <p>Press a number to add a new dice roll result to the history.</p>
      <Box sx={{ display: 'flex', gap: "2px", justifyContent: 'center', flexWrap: 'wrap' }}>
        {VALUES.map((value, index) =>
              <Button
                key={index}               
                variant='contained'
                onClick={() => historyAppend(value)}
                >
                  {value}
              </Button>
           )
        }
      </Box>
      
      
      <Box height={500} sx={{ overflow: 'hidden'}}>
        <h2>Statistics</h2>
        <Plot
          style={{ width: '90%', height: '90%'}}
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
            marker: { color: '#3283e7ff' },
            name: 'current game',
            orientation: "h",
          }]}
          layout={{       
            autosize: true,   
            legend: {
              xanchor: "right",
              bgcolor: "rgba(255,255,255,0.5)",
            },
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

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <h2>Danger Zone</h2>
        
        <p>History of the last 10 dice rolls: ...{history.slice(-10).join(", ") }</p> 

        <Button
          variant='text'
          disabled={history.length === 0}
          onClick={() => historyRemove(history.length-1)}
          >
          <Undo/> UNDO LAST DICE ROLL
        </Button>

        <Button
          variant='text'
          color='warning'
          disabled={history.length === 0}
          onClick={() => historyClear()}
          >
          <DeleteForeverOutlined/> CLEAR HISTORY
        </Button>
        <p>If you pressed CLEAR HISTORY by mistake, simply refresh the page to restore the previous history. Once you press a number again, you will loose the backup.</p>
      </Box>
      
  </Container></>
}

export default App
