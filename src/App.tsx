import { useCallback, useMemo, useState } from 'react'
import './App.css'
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import { Add, Delete, UndoRounded } from '@mui/icons-material';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Plot from 'react-plotly.js';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const COLORS = ['red', 'blue', 'white', 'yellow', 'green', 'brown']
const VALUES = [2,3,4,5,6,7,8,9,10,11,12]

interface Player {
  id: number;
  name:  string;
  color: string;
}

function PlayerRow(params: {
  player: Player,
  onChange: (data: Player) => void,
  onAdd?: (data: Player) => void
  onRemove?: (data: Player) => void
})
{
  const {
    player,
    onRemove: handleRemove,
    onChange: handleChange,
    onAdd: handleAdd
  } = params;

  return <>
  <Stack direction="row" spacing={1} padding={1}>
    <TextField
      fullWidth
      id="outlined-basic"
      label="Player Name"
      value={player.name}
      onChange={(change) => {
        const updated_player = {
          ...player,
          name: change.currentTarget.value
        }
        handleChange(updated_player)
      }}
      variant="outlined" />

    <FormControl fullWidth>
      <InputLabel id="color-select-label">Color</InputLabel>
      <Select
        labelId="color-select-label"
        id="color-select"
        value={player.color}
        defaultValue=""
        onChange={(event: SelectChangeEvent) => {
          const updated_player = {
            ...player,
            color: event.target.value
          }
          handleChange(updated_player)
        }}
        >
          <MenuItem value="">None</MenuItem>
          {COLORS.map(
            _color => <MenuItem key={_color} value={_color}>{_color}</MenuItem>
        )}
      </Select>
    </FormControl>

    { handleAdd && <Button
      disabled={player.name == ""}
      variant="outlined"
      onClick={() => handleAdd(player) }>
      <Add/>
    </Button>}

     { handleRemove && <Button
      variant="outlined"
      onClick={() => handleRemove(player) }>
      <Delete/>
    </Button>}

  </Stack>
  </>
}

let counter = 0;

function makePlayer(): Player
{
  return { id: counter++, name: "", color: "" }
}

function App()
{
  const [players, setPlayers] = useState<Player[]>([])
  const [newPlayerData, setNewPlayerData] = useState<Player> (makePlayer() )
  const [history, setHistory] = useState<number[]>([])


  const addPlayer = (new_player: Player) => {
    setPlayers(_players => [..._players, new_player])
  }


  const handleAddPlayerClick = useCallback( (data: Player) => {
    const new_player: Player = {
      ...data,
      id: counter
    }
    addPlayer(new_player)
    setNewPlayerData( makePlayer() )
  }, [counter])

  const handleRemovePlayerClick = useCallback( (index: number, player: Player) => {
    const new_array = players.toSpliced(index, 1)
    setPlayers(new_array)
  }, [players])

  const [showCount, setShowCount] = useState(false)

  const stats = useMemo(() => {
    const count = new Array(VALUES.length)
    count.fill(0)

    // count each number
    history.forEach( value => count[value] += 1 )

    // normalize ?
    if (!showCount)
    {
        count.forEach( (_, i) => count[i] /= history.length )
    }
    return count
  }, [history, showCount])

  return <>
    <Container>
      <Stack direction="column">
      <h1>Dice Throwing Statistics</h1>

        {/* <h2>Player List</h2>
        {players.map( (each, i) => (
          <Stack key={each.id} direction="row">
            <PlayerRow
              player={each}
              onChange={(p) => players[i] = {...p}}
              onRemove={(p) => handleRemovePlayerClick(i, each)}
            />
          </Stack>
        ))}
        <PlayerRow
          player={newPlayerData}
          onChange={(p) => setNewPlayerData(p)}
          onAdd={handleAddPlayerClick}
        />
        { players.length === 0 && <i>Type a name and pick a color to add your first player.</i>}
           */}
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
      <FormControlLabel
        control={
          <Switch
            value={showCount}
            onClick={() => setShowCount( b => !b )}
        />}
        label="Show Count"
      />
      <Plot
        data={[{
          x: VALUES,
          y: stats,
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: '#325ce7ff' }
        }]}
        layout={{
          title: { text: 'Simple Plot'},
          autosize: true
        }}
      />
      </Stack>
  </Container></>
}

export default App
