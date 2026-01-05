import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import Button from '@mui/material/Button';
import { ReplayOutlined, Undo } from '@mui/icons-material';
import Container from '@mui/material/Container';
import Plot from 'react-plotly.js';
import { Box, ButtonGroup, Divider, FormLabel, Grid, Typography } from '@mui/material';
import AppBarCustom from './AppBarCustom';
import * as package_json from '../package.json';

interface DiceOptions {
  count: number;
  sides: number;
}

function computeAllCombinations(dice: DiceOptions): number[]
{
  let sums = new Array<number>();

  for(let dice_idx = 0; dice_idx < dice.count; ++dice_idx)
  {
    // First dice, simply add each possible value of a dice
    if (dice_idx == 0) {
      for(let side = 1; side <= dice.sides; ++side)     
        sums.push( side )
      continue
    }

    // Next dice, must add by each possible value of a dice
    const new_sums: number[] = [];

    for(const sum of sums )
      for(let side = 1; side <= dice.sides; ++side)     
        new_sums.push( sum + side )

    sums = new_sums
  }

  return sums
}

function computeProbabilities(values: number[], _unique_combinations: number[] ): number[]
{
  const result = new Array(_unique_combinations.length)
  result.fill(0)

  values.forEach((value) => result[value - _unique_combinations[0]] += 1) // count each number

  if (values.length > 0) {
    result.forEach((_, i) => result[i] /= values.length) // normalize
  }

  return result
}

const PAGE = {
  HOME:      "Home",
  STATS:     "Statistics",
  SETTINGS:  "Settings",
  GAME:      "Game",
  ABOUT:     "About"
} as const

function App() {
  const [history, setHistory] = useState<number[]>([])
  const [diceOptions, setDiceOptions] = useState<DiceOptions>({ count: 2, sides: 6}) // todo, save this

  const all_combinations = useMemo( () => {
    return computeAllCombinations(diceOptions)
  }, [diceOptions])

  const unique_combinations = useMemo( () => {
    return Array.from( new Set(all_combinations) )
  }, [all_combinations])

  const expected_probabilities = useMemo( () => {
    return computeProbabilities(all_combinations, unique_combinations)
  }, [all_combinations, unique_combinations])

  const game_probabilities = useMemo(() => {
    return computeProbabilities(history, unique_combinations)
  }, [history, unique_combinations])

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

  const [page, setPage] = useState<string>(PAGE.HOME)

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
        pages={[
          PAGE.HOME,
          PAGE.STATS,
          PAGE.GAME,
          PAGE.ABOUT
        ]}
        onPageChange={setPage}
        title="DR.STATS"
        version={package_json.version}
      />
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          rowGap: 4,
          alignItems: 'stretch',
          paddingTop: 10
      }}>
        <Box
          id={PAGE.HOME}
          sx={{            
            display: 'flex',
            flexDirection: 'column',
            rowGap: 2
          }}>
          <Grid container gridColumn={2} rowGap={2}>
            <Grid size={6} flexDirection="column" display="flex">
              <FormLabel>Dice Count</FormLabel>
              <ButtonGroup aria-label="Basic button group">
                {["One", "Two", "Three"].map( (label, index) => (
                  <Button
                  variant={ diceOptions.count == index+1 ? 'contained' : 'outlined'}
                  onClick={() => setDiceOptions({...diceOptions, count: index+1})}
                  >
                    {label}
                  </Button>
                ))
                }
              </ButtonGroup>
            </Grid>
            <Grid size={6} flexDirection="column" display="flex">
              <FormLabel>Dice Sides</FormLabel>
              <ButtonGroup aria-label="Basic button group">
                {[6].map( (value) => (
                  <Button
                  disabled={true}
                  variant={ diceOptions.sides == value ? 'contained' : 'outlined'}
                  onClick={() => setDiceOptions({...diceOptions, sides: value })}
                  >
                    {value}
                  </Button>
                ))}
              </ButtonGroup>
            </Grid>
          </Grid>

          <Box
            sx={{
              flexDirection: 'row',
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            {unique_combinations.map((value, index) =>
              <Button
                key={index}
                variant='contained'
                onClick={() => historyAppend(value)}
                sx={{ display: "flex", flexDirection: 'column', paddingY: 3, rowGap: 1.5}}
              >
                <Typography lineHeight={0.1} fontSize={20}>{value}</Typography>
                <Typography lineHeight={0.1}>{".".repeat( expected_probabilities[index] * all_combinations.length ) }</Typography>
              </Button>
            )}
            
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'stretch', alignItems: 'center' }}>
            <Typography sx={{ opacity: 0.5, flexGrow: 1 }}>Dice roll count: {history.length} / History: ..{history.slice(-10).join(", ")}.</Typography>            
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
            maxHeight: '100vh',
            minHeight: '500px',
            rowGap: 2
          }}>
            <Typography fontSize={22}>Statistics</Typography>
            <Plot
              style={{ width: '90%' }}
              data={[{
                y: unique_combinations,
                x: expected_probabilities,
                type: 'scatter',
                line: { color: '#ff9e16ff', width: 4, shape:  'vhv' },
                marker: { size: 10 },
                name: 'Theory',
                //visible: "legendonly",
                orientation: "h",
              }, {
                y: unique_combinations,
                x: game_probabilities,
                text: game_probabilities.map(x => `${Math.round(x * history.length)} roll(s)`),
                type: 'bar',
                marker: { color: '#3283e7ff' },
                name: 'Game',
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
                  tickvals: unique_combinations,
                  linewidth: 1,
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
                scrollZoom: false
                //staticPlot: true
              }}
            />
        </Box>

        <Divider></Divider>

        <Box
            id={PAGE.GAME}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
          <Typography fontSize={22}>{PAGE.GAME}</Typography>

          <Box>
            <Button
              variant='contained'
              color='error'
              disabled={history.length === 0}
              onClick={() => historyClear()}
              sx={{ flex: '50px', gap: 1 }}
            >
              <ReplayOutlined/><Typography>RESET</Typography>
            </Button>
          </Box>
          
          <p>
            By pressing the button above, you'll clear the dice roll history.
            Once history has been cleared, pressing a number on the keyboard will start to record a new history.
          </p>
          <p>
            In case you pressed the button by mistake, simply refresh the webpage to restore the previous history.
          </p>
        </Box>  

        <Divider></Divider>

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
          <p>When you find a bug or an issue with the website that would be very useful if you could take some time to describe
            it <a href="https://github.com/berdal84/dice-throwing-statistics/issues">there</a>.</p>

          <Typography>Changes on v0.2</Typography>
          <ul>
            <li>Add Dice Count and Dice Sides</li>
            <li>Add Game section</li>
          </ul>

          <Typography>Changes on v0.1</Typography>
          <ul>
            <li>Add theoretical probabilities under each button's label (as little dots)</li>
            <li>Add "About this website" section</li>
          </ul>

        </Box>
      </Box>
    </Container>
    </>
}

export default App
