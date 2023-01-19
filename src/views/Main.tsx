import { useState } from "react";
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

import { useMutation, useQuery, useQueryClient } from "react-query";
import client from "../client";
import { Card, CardMedia, CardContent, CardActions, Grid } from "@mui/material";

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

export function AppHeader({ onFileUpload, isUploading, onSearch }) {
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
                onChange={e => onSearch(e.target.value)}
              />
            </Search>
          </Stack>
          <div style={{ flexGrow: 1 }} />
          <Button color="inherit">Login</Button>
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
          onClick={() => window.open('http://localhost:4040/api/preview/' + hash)}
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

function FilesList({ files, onDeleteFile }) {
  return (
    <Grid container sx={{ padding: 4 }} spacing={3}>
      {files.map((file) => (
        <Grid key={file._id} item xs={2.5}>
          <FilePreview {...file} onDeleteFile={onDeleteFile} />
        </Grid>
      ))}
    </Grid>
  );
}

export default function Main() {
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient();

  const { data: filesResponse, isLoading } = useQuery("get-files", () =>
    client.get("/files")
  );

  const { mutate: upload, isLoading: isUploading } = useMutation(
    "upload",
    (fileData) => client.post("/upload", fileData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["get-files"] });
      },
    }
  );

  const { mutate: deleteFile } = useMutation(
    "upload",
    (fileId) => client.delete("/file/" + fileId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["get-files"] });
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
      !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AppHeader
        isUploading={isUploading}
        onFileUpload={handleFileUpload}
        onSearch={setSearchQuery}
      />
      <FilesList loading={isLoading} files={files} onDeleteFile={deleteFile} />
    </>
  );
}
