# cryptoleprechaun

* In terminal:

* Create new environment
conda create -n CryptoL_env python=3.6

* Activate new environment
conda activate CryptoL_env

pip install gunicorn
pip install psycopg2
pip install flask
pip install flask-sqlalchemy
pip install pandas

python initdb.py

* Run the app using the following:
FLASK_APP=cryptoleprechaun/app.py flask run

* Generate requirements.txt file:
pip freeze > requirements.txt

touch Procfile

web: gunicorn cryptoleprechaun.app:app