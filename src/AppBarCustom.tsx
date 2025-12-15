import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { CasinoSharp } from '@mui/icons-material';
import { useState, type MouseEventHandler} from 'react';

type ResponsiveAppBarProps = {
  pages: string[];
  onPageChange: (page: string) => void;
  title: string;
  version: string;
}

function ResponsiveAppBar({
  pages, onPageChange,
  title = "TITLE",
  version = "X.Y.Z"
} : ResponsiveAppBarProps )
{
  const [open, setOpen] = useState(false)

  const handleOpenNavMenu: MouseEventHandler<HTMLElement> = (_) => {
    setOpen(true)
  };

  const handleCloseNavMenu = (page: string | null ) => {
    if (page != null)
      onPageChange(page);
    setOpen(false)
  };

  return (
    <AppBar>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>

          <CasinoSharp sx={{ display: 'flex', mr: 1 }} />
          
          <Typography
            variant="h5"
            noWrap
            sx={{
              mr: 2,
              display: 'flex',
              fontFamily: 'monospace',
              fontWeight: 400,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            { title }
            <Typography
              noWrap
              sx={{
                fontSize: 12,
                fontFamily: 'monospace',
                fontWeight: 100,
                letterSpacing: '.1rem',
                color: 'inherit',
                opacity: 0.5,
                textDecoration: 'none',
              }}
            >
              v{ version }
            </Typography>
          </Typography>
        </Box>

        {/* Menu when page is "large" */} 
        <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
          {pages.map((page) => (
            <Button
              key={page}
              onClick={() => handleCloseNavMenu(page) }
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              {page}
            </Button>
          ))}
        </Box>
        
        {/* Menu when page is large "small" */} 
        <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            open={open}
            id="menu-appbar"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            onClose={() => handleCloseNavMenu(null) }
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            {pages.map((page) => (
              <MenuItem key={page} onClick={() => handleCloseNavMenu(page)}>
                <Typography sx={{ textAlign: 'center' }}>{page}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
export default ResponsiveAppBar;