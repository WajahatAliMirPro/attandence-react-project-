import React, { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
} from "@mui/material";

const AdmissionForm = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    address: "",
    gender: "",
    course: "",
  });

  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validate form
  const validate = () => {
    let tempErrors = {};
    tempErrors.fullname = formData.fullname ? "" : "Full Name is required";
    tempErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ? ""
      : "Email is invalid";
    tempErrors.address = formData.address ? "" : "Address is required";
    tempErrors.gender = formData.gender ? "" : "Gender is required";
    tempErrors.course = formData.course ? "" : "Course selection is required";
    setErrors(tempErrors);

    return Object.values(tempErrors).every((x) => x === "");
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form Data Submitted:", formData);
      // Clear form after submission if needed
      // setFormData({ fullname: "", email: "", address: "", gender: "", course: "" });
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: "auto",
        mt: 5,
        p: 3,
        border: "1px solid #ccc",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" mb={3} align="center">
        Admission Form
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Full Name"
          name="fullname"
          value={formData.fullname}
          onChange={handleChange}
          error={Boolean(errors.fullname)}
          helperText={errors.fullname}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={Boolean(errors.email)}
          helperText={errors.email}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Address"
          name="address"
          multiline
          rows={3}
          value={formData.address}
          onChange={handleChange}
          error={Boolean(errors.address)}
          helperText={errors.address}
          margin="normal"
        />

        <FormControl component="fieldset" margin="normal">
          <Typography variant="subtitle1" mb={1}>
            Gender
          </Typography>
          <RadioGroup
            row
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <FormControlLabel value="male" control={<Radio />} label="Male" />
            <FormControlLabel
              value="female"
              control={<Radio />}
              label="Female"
            />
            <FormControlLabel
              value="other"
              control={<Radio />}
              label="Other"
            />
          </RadioGroup>
          {errors.gender && (
            <Typography variant="caption" color="error">
              {errors.gender}
            </Typography>
          )}
        </FormControl>

        <FormControl fullWidth margin="normal" error={Boolean(errors.course)}>
          <InputLabel id="course-label">Course</InputLabel>
          <Select
            labelId="course-label"
            name="course"
            value={formData.course}
            onChange={handleChange}
            label="Course"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="Computer Science">Computer Science</MenuItem>
            <MenuItem value="Business Administration">
              Business Administration
            </MenuItem>
            <MenuItem value="Mechanical Engineering">
              Mechanical Engineering
            </MenuItem>
          </Select>
          {errors.course && (
            <Typography variant="caption" color="error">
              {errors.course}
            </Typography>
          )}
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default AdmissionForm;
