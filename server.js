require('dotenv').config();
const express = require('express');
const mongoose = require('./config/db');
const session = require('express-session');
const authRoutes = require('./routes/auth');