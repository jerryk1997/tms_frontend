import React, { useState } from "react";

import {
  Typography,
  Button,
  TextField,
  Box,
  DialogTitle,
  Dialog,
  Select,
  InputLabel,
  MenuItem,
  FormControl
} from "@mui/material";

import { Done, Close } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

function EditApplicationDialog({ open, setOpen, application, setApplication }) {
	const [updatedApp, setUpdatedApp] = useImmer(application);

	// Date states (Dayjs objects)
	const [startDate, setStartDate] = useState();
	const [endDate, setEndDate] = useState();

  const [createPerms, setCreatePerms] = useState("");
  const [openPerms, setOpenPerms] = useState("");
  const [todoPerms, setTodoPerms] = useState("");
  const [doingPerms, setDoingPerms] = useState("");
  const [donePerms, setDonePerms] = useState("");

	useEffect(() => {
		setStartDate(dayjs(application.startDate));
		setEndDate(dayjs(application.endDate));
	}, [])

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle>Edit Application</DialogTitle>
      <Box
        component="form"
        sx={{
          "& .inputRow": {
            m: 2,
            display: "flex"
          },
          "& .MuiTextField-root, & .MuiSelect-select, & .MuiFormControl-root": {
            marginLeft: 1,
            marginRight: 1,
            width: "25ch"
          },
          "& .wide": {
            width: "100%"
          },
          "& .MuiTypography-root": {
            marginLeft: 3
          },
          "& .MuiButton-root": {
            m: 0.2
          },
          display: "flex",
          flexDirection: "column",
          m: "auto",
          width: "fit-content"
        }}
        noValidate
        autoComplete="off"
      >
        {/* ============ Title ============ */}
        <Typography variant="h5" component="div">
          Details
        </Typography>

        {/* ============ Details ============ */}
        {/* ============ Acrnoym + Rnumber ============ */}
        <div className="inputRow">
          <TextField error={false} id="Acronym" label="Acronym" defaultValue={application.acronym}/>
          <TextField id="rNumber" label="R Number" />
        </div>

        {/* ============ Start / End date ============ */}
        <div className="inputRow">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start date"
              format="DD/MM/YYYY"
							defaultValue={startDate}
              onChange={date => setStartDate(date)}
            />
            <DatePicker
              label="End date"
              format="DD/MM/YYYY"
							value={endDate}
              onChange={date => setEndDate(date)}
            />
          </LocalizationProvider>
        </div>

        {/* ============ Description ============ */}
        <div className="inputRow" fullwidth="true">
          <TextField
            id="description"
            label="Description"
            className="wide"
            size="medium"
            multiline
            maxRows="20"
          />
        </div>

        {/* ============ Task Permissions ============ */}
        <Typography variant="h5" component="div">
          Task Permissions
        </Typography>

        <div className="inputRow">
          {/* ============ Task Permissions ============ */}
          <FormControl>
            <InputLabel id="doing">Create</InputLabel>
            <Select
              labelId="create"
              id="create"
              label="Create"
              value={createPerms}
              onChange={e => setCreatePerms(e.target.value)}
            >
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="open">Open</InputLabel>
            <Select
              labelId="open"
              id="open"
              label="Open"
              value={openPerms}
              onChange={e => setOpenPerms(e.target.value)}
            >
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="todo">To-do</InputLabel>
            <Select
              labelId="todo"
              id="todo"
              label="To-do"
              value={todoPerms}
              onChange={e => setTodoPerms(e.target.value)}
            >
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className="inputRow">
          <FormControl>
            <InputLabel id="doing">Doing</InputLabel>
            <Select
              labelId="doing"
              id="doing"
              label="Doing"
              value={doingPerms}
              onChange={e => setDoingPerms(e.target.value)}
            >
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="done">Done</InputLabel>
            <Select
              labelId="done"
              id="done"
              label="Done"
              value={donePerms}
              onChange={e => setDonePerms(e.target.value)}
            >
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div
          className="inputRow"
          style={{ justifyContent: "right", marginRight: "50px" }}
        >
          <Button variant="contained" style={{ backgroundColor: "#28A745" }}>
            <Done />
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => setOpen(false)}
          >
            <Close />
          </Button>
        </div>
      </Box>
    </Dialog>
  );
}

export default EditApplicationDialog;
