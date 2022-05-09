import React from 'react';
import { makeStyles } from '@mui/styles';
import {
  AppBar, Box, Container, Toolbar, IconButton, Menu, MenuItem, Button, Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EmailIcon from '@mui/icons-material/Email';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from 'assets/mitre-logo.svg';

const useStyles = makeStyles((theme) => ({
  footer: {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.common.grayLight,
    position: 'static',
    marginTop: '2em',
  },
  link: {
    fontWeight: 700,
  },
  logo: {
    objectFit: 'contain',
    height: '3.5em',
  }
}));

const pages = ['FAQ']; // TODO: Add Privacy page, once approved

const Footer = () => {
  const classes = useStyles();
  const history = useHistory();
  const { t } = useTranslation();
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = (page) => {
    setAnchorElNav(null);
    if (page !== null) history.push(`/${page}`);
  };

  return (
    <AppBar className={classes.footer}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={() => handleCloseNavMenu(null)}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => handleCloseNavMenu(page)}>
                  <Typography textAlign="center">{t(`footer.${page}`)}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box sx={{ flexGrow: { xs: 1, md: 0 } }}>
            <img src={logo} alt="Placeholder Mitre logo" style={{ width: '100px' }} sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }} />
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => handleCloseNavMenu(page)}
                sx={{ my: 2, display: 'block' }}
              >
                {t(`footer.${page}`)}
              </Button>
            ))}
          </Box>
          <Box>
            <IconButton
              size="large"
              aria-label="contact"
              color="inherit"
              target="_top"
              rel="noopener noreferrer"
              href="mailto:vci-developers@mitre.org"
            >
              <EmailIcon />
              <Typography variant="button" style={{ fontSize: '0.69rem' }} sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                vci-developers@mitre.org
              </Typography>
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Footer;
