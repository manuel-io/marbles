#!/usr/bin/python3
import sqlite3, sys, os
from contextlib import closing
from flask import Flask, g, render_template, jsonify, make_response, request
from flask_wtf.csrf import CSRFProtect

DATABASE = 'database.db'
app = Flask('marbles')
app.config['SECRET_KEY'] = os.urandom(32)

csrf = CSRFProtect(app)
csrf.init_app(app)

@app.before_request
def before_request():
    db = getattr(g, 'db', None)
    if db is None:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()

@app.route('/create/<level>', methods = ['POST'])
def create(level):
    name = request.form['name']
    team = request.form['team']

    try:
        with closing(g.db.cursor()) as cursor:
            cursor.execute("""INSERT INTO marbles_ranking (name, team, level)
                           VALUES (?, ?, ?)""", [name, team, level])

        g.db.commit()
        return make_response('Created', 201)


    except sqlite3.IntegrityError as e:
        sys.stderr.write('%s\n' % str(e))
        g.db.rollback()
        return make_response('Not Modified', 304)

    except Exception as e:
        sys.stderr.write('%s\n' % str(e))
        g.db.rollback()
        return make_response('Internal Server Error', 500)

@app.route('/update/<level>', methods = ['POST'])
def update(level):
    name = request.form['name']
    team = request.form['team']
    moves = request.form['moves']
    points = request.form['points']
    status = request.form['status']

    try:
        with closing(g.db.cursor()) as cursor:
            cursor.execute("""UPDATE marbles_ranking SET moves = ?, points = ?, status = ?
                           WHERE name = ? AND team = ? AND level = ?""", [moves, points, status, name, team, level])
        g.db.commit()
        return make_response('OK', 200)

    except Exception as e:
        sys.stderr.write('%s\n' % str(e))
        g.db.rollback()
        return make_response('Internal Server Error', 500)

@app.route('/ranking', methods = ['GET'])
def ranking():
    teams = []
    players = []

    try:
        with closing(g.db.cursor()) as cursor:
            cursor.execute("""SELECT team AS name, COUNT(DISTINCT name) AS players, SUM(status) AS conversion, SUM(points) AS total_points, SUM(moves) AS total_moves
                           FROM marbles_ranking GROUP BY team ORDER BY total_points DESC""")

            teams = cursor.fetchall()

            cursor.execute("""SELECT name, team, SUM(status) AS conversion, SUM(points) AS total_points, SUM(moves) AS total_moves
                           FROM marbles_ranking GROUP BY name, team ORDER BY total_points DESC""")

            players = cursor.fetchall()

    except Exception as e:
        sys.stderr.write('%s\n' % str(e))
        return make_response('Internal Server Error', 500)

    return render_template('ranking.html', games = 6, teams = teams, players = players)

@app.route('/', methods = ['GET'])
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host = '127.0.0.1', debug = True)
