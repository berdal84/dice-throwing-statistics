import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import Button from '@mui/material/Button';
import { DeleteForeverOutlined, Undo } from '@mui/icons-material';
import Container from '@mui/material/Container';
import Plot from 'react-plotly.js';
import { Box, Divider, Typography } from '@mui/material';
import AppBarCustom from './AppBarCustom';

const VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const THEORETICAL_COUNT = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]
const THEORETICAL_PROBABILITIES = THEORETICAL_COUNT.map(v => (v / 36))

const PAGE = {
  KEYBOARD:  "Keyboard",
  STATS:     "Statistics",
  SENSITIVE: "Sensitive Operations",
  ABOUT:     "About"
}

function App() {
  const [history, setHistory] = useState<number[]>([])

  const probabilities = useMemo(() => {
    const count = new Array(VALUES.length)
    count.fill(0)

    history.forEach((value) => count[value - VALUES[0]] += 1) // count each number

    if (history.length > 0) {
      count.forEach((_, i) => count[i] /= history.length) // normalize
    }

    return count
  }, [history])


  const load = () => {
    const raw_data = sessionStorage.getItem('data');
    const data = raw_data ? JSON.parse(raw_data) : null;
    if (!data) {
      console.warn("data cannot be found in sessionStorage")
      return;
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

  const historyRemove = useCallback((pos: number) => {
    setHistory(history.toSpliced(pos, 1))
    save()
  }, [history])

  const historyClear = useCallback(() => {
    setHistory([])
  }, [history])

  // Init
  useEffect(() => {
    load()
  }, [])

  const [page, setPage] = useState(PAGE.KEYBOARD)

  useEffect( () => {
    const el = document.getElementById(page)
    if (el)
    {
      window.scrollTo({
        top: el.offsetTop - 100,
        behavior: 'smooth'
      });
    }

  }, [page])

  return <>
    <Container maxWidth="md">
      <AppBarCustom
        pages={[PAGE.KEYBOARD, PAGE.STATS, PAGE.SENSITIVE, PAGE.ABOUT]}
        onPageChange={setPage}
        title="DR.STATS"
        version="v0.1"
      />
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          rowGap: 3,
          alignItems: 'stretch' 
      }}>

        <Box
          id={PAGE.KEYBOARD}
          sx={{
            marginTop: 10,
            display: 'flex',
            flexDirection: 'column',
            rowGap: 2
          }}>

          <Typography fontSize={22}>Keyboard</Typography>

          <Box
            sx={{
              flexDirection: 'row',
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            {VALUES.map((value, index) =>
              <Button
                key={index}
                variant='contained'
                onClick={() => historyAppend(value)}
                sx={{ display: "flex", flexDirection: 'column', paddingY: 3, rowGap: 1.5}}
              >
                <Typography lineHeight={0.1} fontSize={20}>{value}</Typography>
                <Typography lineHeight={0.1}>{".".repeat( THEORETICAL_COUNT[index]) }</Typography>
              </Button>
            )}
            
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'stretch', alignItems: 'center' }}>
            <Typography sx={{ opacity: 0.5, flexGrow: 1 }}>History: ..{history.slice(-10).join(", ")}.</Typography>

            <Button
              variant='text'
              disabled={history.length === 0}
              onClick={() => historyRemove(history.length - 1)}
            >
              <Undo />UNDO
            </Button>

          </Box>

        </Box>

        <Divider></Divider>

        <Box
          id={PAGE.STATS}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            rowGap: 2
          }}>
            <Typography fontSize={22}>Statistics</Typography>

            <Plot
              style={{ width: '90%', height: '100%' }}
              data={[{
                y: VALUES,
                x: THEORETICAL_PROBABILITIES,
                text: THEORETICAL_PROBABILITIES.map(x => `${Math.round(x * 100)}%`),
                type: 'bar',
                marker: { color: '#d2d2d2ff' },
                name: 'theoretical',
                //visible: "legendonly",
                orientation: "h",
              }, {
                y: VALUES,
                x: probabilities,
                text: probabilities.map(x => `${Math.round(x * 100)}%`),
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
                }
              }}
              config={{
                displayModeBar: false,
                responsive: true,
                editable: false,
                scrollZoom: false,
                staticPlot: true
              }}
            />
        </Box>

        <Divider></Divider>

        <Box
          id={PAGE.SENSITIVE}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
          }}>
          <Typography fontSize={22}>{PAGE.SENSITIVE}</Typography>
          <p>Be carefull, you can loose your data here.</p>
          <Button
            variant='text'
            color='warning'
            disabled={history.length === 0}
            onClick={() => historyClear()}
          >
            <DeleteForeverOutlined /> CLEAR HISTORY
          </Button>
          <p>If you pressed CLEAR HISTORY by mistake, simply refresh the page to restore the previous history. Once you press a number again, you will loose the backup.</p>
        </Box>

      </Box>

      <Box
        id={PAGE.ABOUT}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          rowGap: 2
        }}>
        <Typography fontSize={22}>About this website</Typography>
        
        <Typography>Purpose</Typography>
        <p>The goal of this website is to be able to track each dice roll during a 2 dice game, and
          then visualize the probabilities related to that particular game, and also comparing it with the theoretical probabilities.
        </p>

        <Typography>Bugs/Issues</Typography>
        <p>When you find a bug or an issue with the website, please take some time to add a issue in the bug 
          tracker <a href="https://github.com/berdal84/dice-throwing-statistics/issues">here</a></p>

        <Typography>Updates on v0.1</Typography>
        <ul>
          <li>Add theoretical probabilities under each button (from one to 5 dots)</li>
          <li>Add this page so users can keep track of changes</li>
        </ul>

      </Box>
    </Container>
    </>
}

export default App
