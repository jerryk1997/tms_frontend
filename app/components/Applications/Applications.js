// Applications.js
import React, { useContext, useEffect, useState } from "react";
import DispatchContext from "../../DispatchContext";
import { useNavigate } from "react-router-dom";
import Axios, { AxiosError } from "axios";
import { useImmerReducer } from "use-immer";

import Page from "../Page";
import {
  Card,
  CardContent,
  CardActions,
  Stack,
  Typography,
  Button,
  Paper,
  ButtonGroup
} from "@mui/material";
import { Add, RemoveRedEye, Edit } from "@mui/icons-material";
import CreateApplicationDialog from "./CreateApplicationDialog";
import LoadingDotsIcon from "../LoadingDotsIcon";
import ApplicationsStateContext from "./ApplicationsStateContext";
import ApplicationsDispatchContext from "./ApplicationsDispatchContext";

function Applications() {
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  const [userGroups, setUserGroups] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProjectLead, setIsProjectLead] = useState(false);

  /*
	{
		"App_Acronym": "App1",
		"App_Description": "Description 1",
		"App_Rnumber": 123,
		"App_startDate": "2023-01-15",
		"App_endDate": "2023-02-28",
		"App_permit_Create": "project manager",
		"App_permit_Open": "admin",
		"App_permit_toDoList": "dev",
		"App_permit_Doing": "devops",
		"App_permit_Done": "project lead"
	}
	*/

  // Defining applications context
  function applicationsReducer(draft, action) {
    switch (action.type) {
      case "populate applications":
        draft.applications = action.value;
        console.log("Application state: \n", action.value);
        break;
      case "create application":
        const newApplication = action.value;
        draft.applications.push(newApplication);
        break;
      case "edit application":
        const application = draft.applications.find(
          application => application.acronym === action.value.acronym
        );
        const editedFields = action.value.editedFields;
        // Make changes to application
        break;
      case "populate groups":
        draft.groups = action.value;
        break;
    }
  }
  const [state, dispatch] = useImmerReducer(applicationsReducer, {
    applications: [],
    groups: []
  });

  // Functions
  async function checkProjectLead() {
    const urlSafeGroup = encodeURIComponent("project lead");
    try {
      await Axios.get(`auth/verify/${urlSafeGroup}`);
      return true;
    } catch (error) {
      if (error instanceof AxiosError && error.response.status === 401) {
        return false;
      } else {
        console.error(error);
        navigate("/");
        appDispatch({ type: "flash message", value: "There was an error" });
        return false;
      }
    }
  }

  // Use Effects
  useEffect(() => {
    async function initialiseState() {
      console.log("=== Initialising State for Applications");

      setIsProjectLead(await checkProjectLead());

      // Populate application data
      try {
        console.log("Getting applications");
        var allApplicationsResponse = await Axios.get("/app");

        dispatch({
          type: "populate applications",
          value: allApplicationsResponse.data.applications.map(
            applicationData => {
              return {
                acronym: applicationData.App_Acronym,
                description: applicationData.App_Description,
                rNum: applicationData.App_Rnumber,
                startDate: applicationData.App_startDate,
                endDate: applicationData.App_endDate,
                permitCreate: applicationData.App_permit_Create,
                permitOpen: applicationData.App_permit_Open,
                permitTodo: applicationData.App_permit_toDoList,
                permitDoing: applicationData.App_permit_Doing,
                permitDone: applicationData.App_permit_Done
              };
            }
          )
        });
      } catch (error) {
        console.error(error);
        navigate("/");
        appDispatch({ type: "flash message", value: "There was an error" });
        return;
      }

      setIsLoading(false);
    }

    initialiseState();
  }, []);

  async function handleCreateOpen() {
    console.log("=== Handle create application button click");
    const isProjectLead = await checkProjectLead();
    console.log(`User isProjectLead: ${isProjectLead}`);

    if (!isProjectLead) {
      appDispatch({ type: "flash message", value: "Unauthorised" });
    } else {
      try {
        var userGroupsResponse = await Axios.get("/app/groups");
        dispatch({
          type: "populate groups",
          value: userGroupsResponse.data.groups
        });
        console.log("Setting groups to:\n", userGroupsResponse.data.groups);
      } catch (error) {
        // 401 is expected if user is not project lead
        console.error(error);
        navigate("/");
        appDispatch({ type: "flash message", value: "There was an error" });
        return;
      }
    }

    setIsProjectLead(isProjectLead);
    setIsCreateOpen(isProjectLead);
    document.activeElement.blur();
  }

  const handleEditClick = applicationId => {
    console.log(`Edit button clicked for application ID: ${applicationId}`);
    // You can implement the edit functionality here
    // For now, we're just logging the click event.
  };

  return (
    <>
      {isLoading ? (
        <LoadingDotsIcon />
      ) : (
        <ApplicationsStateContext.Provider value={state}>
          <ApplicationsDispatchContext.Provider value={dispatch}>
            <Page title="Applications">
              <CreateApplicationDialog
                open={isCreateOpen}
                setOpen={setIsCreateOpen}
              />

              <div className="container py-md-5">
                {/* ================== Header ================== */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px"
                  }}
                >
                  {/* ================== Title ================== */}
                  <h1 style={{ flex: 1 }}>Applications</h1>

                  {/* ================== Create button ================== */}
                  {isProjectLead && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleCreateOpen}
                      endIcon={<Add />}
                      sx={{ height: 32 }}
                      style={{ backgroundColor: "#28A745" }}
                    >
                      Create
                    </Button>
                  )}
                </div>

                {/* ================== Application List ================== */}
                <Stack spacing={2}>
                  {state.applications.map((application, index) => {
                    return (
                      <Paper elevation={4} key={index}>
                        <Card sx={{ minWidth: 275 }}>
                          <CardContent style={{ display: "flex" }}>
                            {/* ==== Application details ==== */}
                            <div style={{ flex: 1, cursor: "pointer" }}>
                              <Typography variant="h5" component="div">
                                {application.acronym}
                              </Typography>
                              <Typography
                                sx={{
                                  color: "text.secondary"
                                }}
                              >
                                Start Date: {application.startDate}
                                <br />
                                End Date: {application.endDate}
                              </Typography>
                            </div>
                            {/* ==== Buttons ==== */}
                            {/* <CardActions>
                      <Button variant="contained">Edit</Button>
                    </CardActions> */}
                            <CardActions>
                              <ButtonGroup variant="contained">
                                <Button style={{ backgroundColor: "#28A745" }}>
                                  <RemoveRedEye />
                                </Button>
                                <Button>
                                  <Edit />
                                </Button>
                              </ButtonGroup>
                            </CardActions>
                          </CardContent>
                        </Card>
                      </Paper>
                    );
                  })}
                </Stack>
              </div>
            </Page>
          </ApplicationsDispatchContext.Provider>
        </ApplicationsStateContext.Provider>
      )}
    </>
  );
}

export default Applications;
