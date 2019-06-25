import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
# Database Setup
#################################################

#app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/7mos_test_data.sql"
#app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/CryptoL_db.sql"
#app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/7mos_test_data.db"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/data.db"

db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
Test_Data = Base.class.data


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")


@app.route("/testdata")
def testdata():
    """Return the testdata"""
    sel = [
        Test_Data.Low,
        Test_Data.Close,
        Test_Data.Open,
        Test_Data.High,
        Test_Data.UnitVolume,
        Test_Data.bitfinex_longs,
        Test_Data.bitfinex_shorts,
        Test_Data.bitfinex_dominance,
        Test_Data.bitfinex_funding,
        Test_Data.Date,
    ]

    results = db.session.query(*sel).all()

    # Create a dictionary entry for each row of metadata information
    test_data = {}
    for result in results:
        test_data["Low"] = result[0]
        test_data["Close"] = result[1]
        test_data["Open"] = result[2]
        test_data["High"] = result[3]
        test_data["UnitVolum"] = result[4]
        test_data["bitfinex_long"] = result[5]
        test_data["bitfinex_shorts"] = result[6]
        test_data["bitfinex_dominance"] = result[7]
        test_data["bitfinex_funding"] = result[8]
        test_data["Date"] = result[9]

    return jsonify(test_data)


if __name__ == "__main__":
    app.run()
