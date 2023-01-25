import { useEffect, useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Stack } from "@mui/system";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import moment from "moment";
import { useSessionStorage } from "react-use";

import { useMutation, useQuery, useQueryClient } from "react-query";
import client from "../client";
import { Card, CardMedia, CardContent, CardActions, Grid } from "@mui/material";

import { LoginModal } from "./LoginModal";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

export function AppHeader({
  onFileUpload,
  isUploading,
  onSearch,
  userToken,
  onLogout,
  username,
}) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Stack direction="row" spacing={4}>
            <Typography variant="h6" component="div">
              Online File Storage
            </Typography>
            <Button
              sx={{ background: "rgba(255, 255, 255, 0.2)" }}
              variant="contained"
              component="label"
            >
              {isUploading ? "UPLOADING..." : "UPLOAD FILE"}
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={onFileUpload}
              />
            </Button>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
                onChange={(e) => onSearch(e.target.value)}
              />
            </Search>
          </Stack>
          <div style={{ flexGrow: 1 }} />
          {userToken ? (
            <Stack direction="row" alignItems="center" spacing={3}>
              <Typography color="lightgreen">
                (logged in as <b>{username}</b>)
              </Typography>
              <Button color="inherit" onClick={onLogout}>
                Logout
              </Button>
            </Stack>
          ) : (
            <Button color="inherit">Login</Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

function FilePreview({ _id: id, url, name, hash, createdAt, onDeleteFile }) {
  return (
    <Card sx={{ width: 300, p: 1 }}>
      <CardMedia sx={{ height: 140 }} image={url} title={name} />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Uploaded on <b>{moment(createdAt).format("DD MMM YYYY / HH:mm")}</b>
          <br />
          by Admin user
        </Typography>
        <Typography variant="body2" color="text.secondary">
          #{hash}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          size="small"
          onClick={() => window.open(url)}
        >
          Download
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() =>
            window.open("http://localhost:4040/api/preview/" + hash)
          }
        >
          Preview
        </Button>
        <div style={{ flexGrow: 1 }} />
        <IconButton
          size="small"
          sx={{ color: "#F44336" }}
          onClick={() => onDeleteFile(id)}
        >
          <DeleteForeverIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}

function FilesList({ files, onDeleteFile, isAuthorized }) {
  const lastFileUploadedAt = files?.sort((a, b) => a.createdAt > b.createdAt)[0]
    ?.createdAt;

  return (
    <>
      {isAuthorized && files?.length > 0 && (
        <Stack>
          <Typography
            fontSize={16}
            variant="h6"
            component="h6"
            sx={{ px: 4, pt: 2 }}
          >
            Found files: <b>{files.length}</b> {' | '}
            Last file uploaded at{" "}
            <b>{moment(lastFileUploadedAt).format("DD MMM YYYY / HH:mm")}</b>
          </Typography>
          <Grid container sx={{ padding: 4 }} spacing={3}>
            {files.map((file) => (
              <Grid key={file._id} item xs={2.5}>
                <FilePreview {...file} onDeleteFile={onDeleteFile} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}
      {!isAuthorized && (
        <Typography
          variant="h5"
          component="h5"
          sx={{ textAlign: "center", mt: 15 }}
        >
          You need to log in to see pictures
        </Typography>
      )}
      {isAuthorized && files?.length === 0 && (
        <Typography
          variant="h5"
          component="h5"
          sx={{ textAlign: "center", mt: 15 }}
        >
          You have no files yet. Use "upload" button
        </Typography>
      )}
    </>
  );
}

export default function Main() {
  const [userData, setUserData] = useSessionStorage("userData", null);

  const userToken = userData?.token;

  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const config = userToken
    ? {
        headers: {
          authorization: userToken,
        },
      }
    : {};

  const fetchQueryKey = ["get-files", userToken];

  const { data: filesResponse, isLoading } = useQuery(fetchQueryKey, () =>
    client.get("/files", config)
  );

  const { mutate: upload, isLoading: isUploading } = useMutation(
    "upload",
    (fileData) => client.post("/upload", fileData, config),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: fetchQueryKey });
      },
    }
  );

  const { mutate: loginUser, data: loginData } = useMutation(
    "login",
    (data) => client.post("/login", data),
    {
      onError: () => {
        alert("Wrong username & password");
      },
    }
  );

  useEffect(() => {
    if (loginData?.data) {
      setUserData(loginData?.data);
    }
  }, [loginData]);

  const { mutate: deleteFile } = useMutation(
    "delete",
    (fileId) => client.delete("/file/" + fileId, config),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: fetchQueryKey });
      },
    }
  );

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    upload(formData);
  };

  const files = (filesResponse?.data ?? []).filter(
    (file) =>
      !searchQuery ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AppHeader
        isUploading={isUploading}
        onFileUpload={handleFileUpload}
        onSearch={setSearchQuery}
        userToken={userToken}
        onLogout={() => setUserData(null)}
        username={userData?.username}
      />
      <FilesList
        loading={isLoading}
        files={files}
        isAuthorized={userToken}
        onDeleteFile={deleteFile}
      />
      <LoginModal open={!userToken} onLogin={loginUser} />
    </>
  );
}
