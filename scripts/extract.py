#!/usr/bin/env python3
"""Extrai o dataset do relatório a partir da base claude-mem e grava assets/data.js.

Escopo: projetos da plataforma Ascenty/TOTVS. Projetos pessoais/estudo são excluídos (lista PERSONAL).
Horas ativas: soma dos intervalos entre eventos consecutivos com teto de 30 min de inatividade
(eventos isolados contam 5 min).
"""
import collections
import datetime
import json
import os
import sqlite3

DB = os.path.expanduser('~/.claude-mem/claude-mem.db')
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'data.js')
PERSONAL = {
    'bolao-nfl', 'edge-board', 'zinsono', 'goXpress', 'tiktok', 'convite-nicolas', 'math-adventure-land',
    'bolao-da-copa', 'genealogy', 'incomum-strategies', 'river-raid', 'bal-o-m-gico-da-alfabetiza-o',
    'aventura-do-saber', 'brasileiro', 'wp', 'js', 'warp', 'd9s', 'terminal', 'shell', 'temp', 'src',
    'artigos', 'vmx', 'init-7995c9', 'ms-crud-stub', 'requester',
}
CAP = 30 * 60 * 1000
ISOLATED = 5 * 60 * 1000
MONTHS = ['2026-06', '2026-07', '2026-08', '2026-09']
PERIOD_START = '2026-06-01'  # recorte solicitado: medir somente de junho em diante


def scope(p):
    return 'personal' if p in PERSONAL else 'ascenty'


def active_hours(evs):
    evs = sorted(evs)
    total = 0
    for a, b in zip(evs, evs[1:]):
        d = b - a
        total += d if d <= CAP else ISOLATED
    return total / 3.6e6


def month(e):
    return datetime.datetime.fromtimestamp(e / 1000, datetime.UTC).strftime('%Y-%m')


def day(e):
    return datetime.datetime.fromtimestamp(e / 1000, datetime.UTC).strftime('%Y-%m-%d')


def main():
    c = sqlite3.connect(DB)
    q = lambda s: list(c.execute(s))
    pl = ','.join("'%s'" % x for x in PERSONAL)
    start_ms = int(datetime.datetime.fromisoformat(PERIOD_START + 'T00:00:00+00:00').timestamp() * 1000)
    obs = q('select memory_session_id,project,created_at_epoch,type,discovery_tokens from observations '
            'where created_at_epoch >= %d' % start_ms)
    prompts = q('select s.project,up.created_at_epoch from user_prompts up '
                'join sdk_sessions s on s.content_session_id=up.content_session_id '
                'where up.created_at_epoch >= %d' % start_ms)
    per = 'created_at_epoch >= %d' % start_ms

    M = {m: dict(month=m, obsAsc=0, obsOther=0, promptsAsc=0, promptsOther=0, hoursAsc=0, daysAsc=0,
                 tokensAsc=0, bugfixAsc=0, featureAsc=0, discoveryAsc=0) for m in MONTHS}
    evm, dm = collections.defaultdict(list), collections.defaultdict(set)
    for sid, p, e, t, tk in obs:
        m = month(e)
        if m not in M:
            continue
        if scope(p) == 'ascenty':
            M[m]['obsAsc'] += 1
            M[m]['tokensAsc'] += tk
            evm[m].append(e)
            dm[m].add(day(e))
            for k in ('bugfix', 'feature', 'discovery'):
                if t == k:
                    M[m][k + 'Asc'] += 1
        else:
            M[m]['obsOther'] += 1
    for p, e in prompts:
        m = month(e)
        if m not in M:
            continue
        if scope(p) == 'ascenty':
            M[m]['promptsAsc'] += 1
            evm[m].append(e)
        else:
            M[m]['promptsOther'] += 1
    for m in MONTHS:
        M[m]['hoursAsc'] = round(active_hours(evm[m]), 1)
        M[m]['daysAsc'] = len(dm[m])

    T = collections.defaultdict(lambda: dict(count=0, hours=0.0, tokens=0))
    ev = collections.defaultdict(list)
    for sid, p, e, t, tk in obs:
        if scope(p) == 'ascenty':
            ev[sid].append((e, t))
            T[t]['count'] += 1
            T[t]['tokens'] += tk
    for sid, lst in ev.items():
        lst.sort()
        prev = None
        for e, t in lst:
            d = (e - prev) if prev is not None else ISOLATED
            if d > CAP:
                d = ISOLATED
            T[t]['hours'] += d / 3.6e6
            prev = e
    types = [dict(type=k, count=v['count'], hours=round(v['hours'], 1), tokens=v['tokens']) for k, v in T.items()]

    P = collections.defaultdict(lambda: dict(obs=0, tokens=0, ev=[], bugfix=0, feature=0, files=set()))
    for sid, p, e, t, tk in obs:
        if scope(p) == 'ascenty':
            P[p]['obs'] += 1
            P[p]['tokens'] += tk
            P[p]['ev'].append(e)
            if t == 'bugfix':
                P[p]['bugfix'] += 1
            if t == 'feature':
                P[p]['feature'] += 1
    for p, f in q('select project,files_modified from observations where %s' % per):
        if scope(p) == 'ascenty' and f:
            try:
                lst = json.loads(f)
            except ValueError:
                lst = []
            P[p]['files'].update(lst)
    projects = sorted([dict(name=p, obs=v['obs'], tokens=v['tokens'], hours=round(active_hours(v['ev']), 1),
                            bugfix=v['bugfix'], feature=v['feature'], files=len(v['files'])) for p, v in P.items()],
                      key=lambda x: -x['hours'])

    all_asc = [e for _, p, e, _, _ in obs if scope(p) == 'ascenty'] + [e for p, e in prompts if scope(p) == 'ascenty']
    all_oth = [e for _, p, e, _, _ in obs if scope(p) != 'ascenty'] + [e for p, e in prompts if scope(p) != 'ascenty']
    like = lambda cols: ' or '.join("lower(title) like '%%%s%%'" % w for w in cols)
    totals = dict(
        sessions=q('select count(*) from sdk_sessions where started_at_epoch >= %d' % start_ms)[0][0],
        sessionsAsc=q('select count(*) from sdk_sessions where started_at_epoch >= %d and project not in (%s)' % (start_ms, pl))[0][0],
        prompts=len(prompts), promptsAsc=sum(1 for p, e in prompts if scope(p) == 'ascenty'),
        obs=len(obs), obsAsc=sum(1 for o in obs if scope(o[1]) == 'ascenty'),
        tokens=sum(o[4] for o in obs), tokensAsc=sum(o[4] for o in obs if scope(o[1]) == 'ascenty'),
        hoursAsc=round(active_hours(all_asc), 1), hoursOther=round(active_hours(all_oth), 1),
        daysAsc=len({day(e) for e in all_asc}), daysAll=len({day(o[2]) for o in obs}),
        projectsAsc=len(P), filesModAsc=len(set().union(*[v['files'] for v in P.values()])),
        firstAsc=min(day(e) for e in all_asc), lastAsc=max(day(e) for e in all_asc),
        summariesAsc=q('select count(*) from session_summaries where %s and project not in (%s)' % (per, pl))[0][0],
        testObs=q('select count(*) from observations where %s and project not in (%s) and (%s)' % (per, pl, like(['test', 'teste'])))[0][0],
        securityObs=q('select count(*) from observations where %s and project not in (%s) and (%s)' % (per, pl, like(['security', 'vulnerab', 'seguran', 'traversal', 'token exposure'])))[0][0],
        docsObs=q('select count(*) from observations where %s and project not in (%s) and (%s)' % (per, pl, like(['claude.md', 'document', 'especifica', 'specification', 'plan', 'jira', 'backlog'])))[0][0],
    )
    d0 = datetime.date.fromisoformat(PERIOD_START)
    d1 = datetime.date.fromisoformat(totals['lastAsc'])
    totals['periodStart'] = PERIOD_START
    totals['periodDays'] = (d1 - d0).days + 1
    totals['periodMonths'] = round(totals['periodDays'] / 30.44, 1)
    data = dict(generatedAt=datetime.date.today().isoformat(), months=list(M.values()), types=types,
                projects=projects, totals=totals)
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write('window.REPORT_DATA = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    print('gravado', OUT, json.dumps(totals, indent=1))


if __name__ == '__main__':
    main()
