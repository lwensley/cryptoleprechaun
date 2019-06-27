from .app import db


class DataTable(db.Model):
    __tablename__ = 'data'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(64))
    open = db.Column(db.Float)
    high = db.Column(db.Float)
    low = db.Column(db.Float)
    close = db.Column(db.Float)
    volume = db.Column(db.Float)
    market_cap = db.Column(db.Float)
    unit_volume = db.Column(db.Float)
    rolling_20_d = db.Column(db.Float)
    date_2 = db.Column(db.Float)
    bitfinex_shorts = db.Column(db.Float)
    bitfinex_longs = db.Column(db.Float)
    bitfinex_volume = db.Column(db.Float)
    total_crypto_cap = db.Column(db.Float)
    bitcoin_dominance = db.Column(db.Float)
    bitmex_funding = db.Column(db.Float)

    def __repr__(self):
        return '<DataTable %r>' % (self.name)
