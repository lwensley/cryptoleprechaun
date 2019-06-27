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

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///./db/data.sqlite"
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# print out Table Names
print("Database Table Names")
print(db.engine.table_names())

# make sure our table has a primary key otherwise it won't work with SQLAlchemy
print("Database Tables that have Keys")
print(Base.classes.keys())

# Save references to the table
BTC_Data = Base.classes.btc



@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/candlestick")
def candlestick():
    
    return render_template("candlestick.html")

@app.route("/project_info")
def project_info():

    return render_template("project_info.html")

@app.route("/team_info")
def team_info():

    return render_template("team_info.html")


@app.route("/names")
def names():
    """Return a list of sample names."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(BTC_Data).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Return a list of the column names (sample names)
    return jsonify(list(df.columns)[2:])



#vNeed to add in the path for once we select the data
@app.route("/btc_data")
def selected_btcdata():
    # Return the data for the selected dates
    sel = [
        BTC_Data.date,
        BTC_Data.open,
        BTC_Data.high,
        BTC_Data.low,
        BTC_Data.close,
        BTC_Data.volume,
        BTC_Data.market_cap,
        BTC_Data.unit_volume,
        BTC_Data.rolling_20_d,
        BTC_Data.date_2,
        BTC_Data.bitfinex_shorts,
        BTC_Data.bitfinex_longs,
        BTC_Data.bitfinex_volume,
        BTC_Data.total_crypto_cap,
        BTC_Data.bitcoin_dominance,
        BTC_Data.bitmex_funding
    ]

    # results = db.session.query(*sel).filter(BTC_Data.date >= start).filter(BTC_Data <= end).all()
    results = db.session.query(*sel).all()

    # Create a dictionary entry for each row of metadata
    selected_btcdata = {}
    for result in results:
        BTC_Data
    
    print(selected_btcdata)
    return jsonify(selected_btcdata)

if __name__ == "__main__":
    app.run()