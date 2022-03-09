import * as React from 'react';
import { useState, useEffect, useContext } from "react";
import { useSession } from "../../contexts/session";
import UserServer from '../../models/UserServer';
import PropTypes from 'prop-types';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
//import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TableFooter from "@mui/material/TableFooter";
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';

import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import HelpIcon from '@mui/icons-material/Help';


function TablePaginationActions(props) {
  const { count, page, rowsPerPage, onChangePage } = props;
  
  const theme2 = useTheme();

  const handleFirstPageButtonClick = (event) => {
      onChangePage(event, 0);
  };

  const handleBackButtonClick = (event) => {
      onChangePage(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
      onChangePage(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
      onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  
  return (
      <React.Fragment>
          <IconButton
              onClick={handleFirstPageButtonClick}
              disabled={page === 0}
              aria-label="first page"
          >
              {theme2.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
          </IconButton>
          <IconButton
              onClick={handleBackButtonClick}
              disabled={page === 0}
              aria-label="previous page"
          >
              {theme2.direction === "rtl" ? (
                  <KeyboardArrowRight />
              ) : (
                  <KeyboardArrowLeft />
              )}
          </IconButton>
          <IconButton
              onClick={handleNextButtonClick}
              disabled={page >= Math.ceil(count / rowsPerPage) - 1}
              aria-label="next page"
          >
              {theme2.direction === "rtl" ? (
                  <KeyboardArrowLeft />
              ) : (
                  <KeyboardArrowRight />
              )}
          </IconButton>
          <IconButton
              onClick={handleLastPageButtonClick}
              disabled={page >= Math.ceil(count / rowsPerPage) - 1}
              aria-label="last page"
          >
              {theme2.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
          </IconButton>
      </React.Fragment>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

export const ServersView = (props) => {
//export const ServersView = (props: any) => {
  const [tab, setTab] = useState(0);
  const { session, setSession } = useSession();
  
  const [servers, setServers] = useState([]);
  const [userServers, setUserServers] = useState([]);

  const [rowsPerPageT1, setRowsPerPageT1] = React.useState(5);
  const [rowsPerPageT2, setRowsPerPageT2] = React.useState(10);
  const [pageT1, setPageT1] = React.useState(0);
  const [pageT2, setPageT2] = React.useState(0);
  const emptyRowsT1 = rowsPerPageT1 - Math.min(rowsPerPageT1, userServers.length - pageT1 * rowsPerPageT1);
  const emptyRowsT2 = rowsPerPageT2 - Math.min(rowsPerPageT2, servers.length - pageT2 * rowsPerPageT2);
/*
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
*/
  
  const isConnected = session && session.isConnected;

  const register = async (serverId) => {
    let userServer = await UserServer.register(session, serverId);
    session.userServers.push(userServer);
    setSession(session);
    setTab(0);
  };

  const unregister = async (serverId, index) => {
    let response = await UserServer.unregister(session, serverId);
    if (response) {
      let userServers = [...session.userServers];
      userServers.splice(index, 1);
      session.userServers = userServers;
      setSession(session);
      setUserServers(userServers);
      setServers(session.servers);
    }
  };

  const handleChange = (_event, newValue) => {
    setTab(newValue);
  };

  useEffect(() => {
    let servers = session && session.servers;
    const userServers = session && session.userServers;

    if (servers && userServers) {
      let userServerIds = new Map();

      userServers.forEach(userServer => {
        userServerIds.set(userServer.serverId, true);
      });

      let newServers = servers.map(server => {
        server.registered = userServerIds.get(server.serverId) || false;

        return server;
      });

      setServers(newServers);
      setUserServers(userServers);
    }

  }, [session]);
  
  const handleChangePageT1 = (event, newPage) => {
    setPageT1(newPage);
  };

  const handleChangeRowsPerPageT1 = (event) => {
      setRowsPerPageT1(parseInt(event.target.value, 10));
      setPageT1(0);
  };

  const handleChangePageT2 = (event, newPage) => {
    
    setPageT2(newPage);
  };

  const handleChangeRowsPerPageT2 = (event) => {
  setRowsPerPageT2(parseInt(event.target.value, 10));
    setPageT2(0);
  };

  return (
    <React.Fragment> 
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleChange} aria-label="Server Tabs">
          <Tab label="Registered" />
          <Tab label="All" />
        </Tabs>
      </Box>

      {tab === 0 && 
        <React.Fragment>
          <TableContainer>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" style={{ width: '1%' }}>Name</TableCell>
                  <TableCell align="left" style={{ width: '70%' }}></TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {(rowsPerPageT1 > 0
                  ? userServers.slice(pageT1 * rowsPerPageT1, pageT1 * rowsPerPageT1 + rowsPerPageT1)
                  : userServers
                ).map((server,i) => (
                            <TableRow key={i}>
                              <TableCell style={{ verticalAlign: 'middle' }}>
                                  <Avatar component={Paper} 
                                      elevation={4}
                                      alt={server.name} 
                                      src={`/server-logos/${server.logo}`}
                                      sx={{ width: 30, height: 30, bgcolor: "#333" }}
                                  />
                              </TableCell>
                              <TableCell  >{server.name}</TableCell>
                              <TableCell align="right">
                                <Button color="primary" size="small" variant="contained" onClick={() => unregister(server.serverId, i)}>Unregister</Button>
                              </TableCell>
                          </TableRow>))}
                  {emptyRowsT1 > 0 && (
                      <TableRow style={{ height: 53 * emptyRowsT1 }}>
                          <TableCell colSpan={3} />
                      </TableRow>
                  )}
              </TableBody>
              <TableFooter>
                  <TableRow>
                      <TablePagination
                          rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                          component="div"
                          count={userServers.length}
                          rowsPerPage={rowsPerPageT1}
                          page={pageT1}
                          SelectProps={{
                              inputProps: { "aria-label": "rows per page" },
                              native: true,
                          }}
                          onChangePage={handleChangePageT1}
                          onChangeRowsPerPage={handleChangeRowsPerPageT1}
                          ActionsComponent={TablePaginationActions}
                      />
                  </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </React.Fragment>
      }
      {tab === 1 && 
        <React.Fragment>
            <TableContainer>
              <Table aria-label="All Table">
                <TableHead>
                  <TableRow>
                    <TableCell align="left" style={{ width: '1%' }}>Name</TableCell>
                    <TableCell align="left" style={{ width: '70%' }}></TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                    {(rowsPerPageT2 > 0
                      ? servers.slice(pageT2 * rowsPerPageT2, pageT2 * rowsPerPageT2 + rowsPerPageT2)
                      : servers
                    ).map((server,i) => (
                              <TableRow key={i}>
                                <TableCell style={{ verticalAlign: 'middle' }}>
                                  <Avatar component={Paper} 
                                      elevation={4}
                                      alt={server.name} 
                                      src={`/server-logos/${server.logo}`}
                                      sx={{ width: 30, height: 30, bgcolor: "#333" }}
                                  />
                                </TableCell>
                                <TableCell  >{server.name}</TableCell>
                                <TableCell align="right">
                                  <Button color="primary" size="small" variant="contained" onClick={() => register(server.serverId)}>Register</Button>
                                </TableCell>
                            </TableRow>))}
                    {emptyRowsT2 > 0 && (
                        <TableRow style={{ height: 53 * emptyRowsT2 }}>
                            <TableCell colSpan={3} />
                        </TableRow>
                    )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                            component="div"
                            count={servers.length}
                            rowsPerPage={rowsPerPageT2}
                            page={pageT2}
                            SelectProps={{
                                inputProps: { "aria-label": "rows per page" },
                                native: true,
                            }}
                            onChangePage={handleChangePageT2}
                            onChangeRowsPerPage={handleChangeRowsPerPageT2}
                            ActionsComponent={TablePaginationActions}
                        />
                    </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
        </React.Fragment>
        }
    </React.Fragment>
  );
}

export default ServersView;