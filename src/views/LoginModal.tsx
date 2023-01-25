import React, {useState} from "react";
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import {Controller, useForm} from 'react-hook-form';

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

export function LoginModal({ open, onClose, onLogin }) {
  const { control, handleSubmit } = useForm();

  const handleLogin = (values) => {
    onLogin(values);
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ ...style, width: 400 }}>
        <form onSubmit={handleSubmit(handleLogin)}>
          <Stack spacing={1}>
            <Typography variant="h5">Login</Typography>
            <Controller
              control={control}
              name="username"
              rules={{ required: true }}
              render={({ field: { onChange } }) => (
                <TextField
                  required
                  label="Username"
                  onChange={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              rules={{ required: true }}
              render={({ field: { onChange } }) => (
                <TextField
                  required
                  type="password"
                  label="Password"
                  onChange={onChange}
                />
              )}
            />
            <Button type="submit" variant="contained">
              Login
            </Button>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
}
