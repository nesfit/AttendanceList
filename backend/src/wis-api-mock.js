// import http from 'http';
import https from 'https';
import express from 'express';
import xmlrpc from 'xmlrpc';

import config from './config';

const app = express();
app.use(express.json()); // parser for application/json request type

app.get('/FIT/db', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const data = Buffer.from(token, 'base64')
    .toString();

  if (data === 'zbysek:voda') {
    res.json({ error: null });
  } else {
    res.status(400);
    res.json({ error: 'Bad user' });
  }
});

app.get('/FIT/db/vyuka/rest/courses', (req, res) => {
  if (req.query.abbrv !== 'PDS') {
    res.json({});
    return;
  }

  const json = {
    'status': 'OK',
    'count': 25,
    'data': {
      'id': 12876,
      'abbrv': 'PDS',
      'year': 2018,
      'sem': 'L',
      'lang': 'cs',
      'credits': 5,
      'completion': 'Zk',
      'hr_lect': 39,
      'hr_exc': 4,
      'hr_lab': 2,
      'hr_proj': 7,
      'capacity': 300,
      'students': 147,
      'fa_id': 79,
      'fa_abbrv': 'FIT VUT',
      'fa_url': 'http://www.fit.vutbr.cz/',
      'dept_id': 145,
      'dept_abbrv': 'UIFS FIT VUT',
      'dept_url': 'http://www.fit.vutbr.cz/units/UIFS/',
      'title': 'Přenos dat, počítačové sítě a protokoly',
      'exam': 'C',
      'pt_exam': 60,
      'pt_half': 15,
      'pt_proj': 25,
      'update': '2019-01-16T17:22:32'
    }
  };

  res.json(json);
});

app.get('/FIT/db/vyuka/rest/course/:course', (req, res) => {
  if (req.params.course !== '12876') {
    res.json({});
    return;
  }

  const json = {
    'status': 'OK',
    'count': 1,
    'data': {
      'id': 12876,
      'abbrv': 'PDS',
      'year': 2018,
      'sem': 'L',
      'lang': 'cs',
      'credits': 5,
      'completion': 'Zk',
      'hr_lect': 39,
      'hr_exc': 4,
      'hr_lab': 2,
      'hr_proj': 7,
      'capacity': 300,
      'students': 147,
      'fa_id': 79,
      'fa_abbrv': 'FIT VUT',
      'fa_url': 'http://www.fit.vutbr.cz/',
      'dept_id': 145,
      'dept_abbrv': 'UIFS FIT VUT',
      'dept_url': 'http://www.fit.vutbr.cz/units/UIFS/',
      'title': 'Přenos dat, počítačové sítě a protokoly',
      'exam': 'C',
      'pt_exam': 60,
      'pt_half': 15,
      'pt_proj': 25,
      'update': '2019-01-16T17:22:32'
    },
    'links': {
      'teachers': '/FIT/db/vyuka/rest/course/12876/teachers',
      'schedule': '/FIT/db/vyuka/rest/course/12876/schedule',
      'texts': '/FIT/db/vyuka/rest/course/12876/texts',
      'fields': '/FIT/db/vyuka/rest/course/12876/fields',
      'students': '/FIT/db/vyuka/rest/course/12876/students',
      'items': '/FIT/db/vyuka/rest/course/12876/items',
      'teams': '/FIT/db/vyuka/rest/course/12876/teams'
    }
  };

  res.json(json);
});

app.get('/FIT/db/vyuka/rest/course/:course/items', (req, res) => {
  if (req.params.course !== '12876') {
    res.json({});
    return;
  }

  const json = {
    'status': 'OK',
    'count': 3,
    'data': [
      {
        'id': 72485,
        'class': 'select',
        'order': 1,
        'max': 25,
        'title': 'Projekt',
        'start': '2019-02-15',
        'end': '2019-04-28',
        'reg_start': '2019-02-15T20:08:00',
        'reg_end': '2019-04-27T00:00:00',
        'update': '2019-02-12T20:53:13'
      },
      {
        'id': 72489,
        'class': 'single',
        'entry': 'listed',
        'show': 0,
        'limit': 0,
        'reg': 0,
        'order': 2,
        'max': 15,
        'title': 'P\u016flsemestr\u00e1ln\u00ed zkou\u0161ka',
        'start': '2019-03-22',
        'end': '2019-03-22',
        'reg_start': '0000-00-00T20:02:00',
        'update': '2019-01-17T17:19:37'
      },
      {
        'id': 72490,
        'class': 'multi',
        'order': 3,
        'min': 25,
        'max': 60,
        'title': 'Semestr\u00e1ln\u00ed zkou\u0161ka',
        'update': '2019-01-17T17:20:59'
      }
    ]
  };

  res.json(json);
});

app.get('/FIT/db/vyuka/rest/course/:course/item/:item/variants', (req, res) => {
  if (req.params.course !== '12876' || req.params.item !== '72485') {
    res.json({});
    return;
  }

  const json = {
    'status': 'OK',
    'count': 20,
    'data': [
      {
        'id': 72486,
        'show': 1,
        'limit': 170,
        'reg': 111,
        'title': '[1] Hromadný projekt - Hybridní chatovací P2P síť',
        'update': '2019-02-18T14:44:06'
      },
      {
        'id': 72487,
        'show': 1,
        'limit': 20,
        'reg': 0,
        'title': '[0] Uznání bodů z minulého roku',
        'update': '2019-02-15T08:00:48'
      },
      {
        'id': 72488,
        'show': 1,
        'limit': 3,
        'reg': 1,
        'title': '[2] (dr. Veselý) Parser kryptoměnových adres',
        'update': '2019-02-15T08:00:48'
      },
      {
        'id': 72557,
        'show': 1,
        'limit': 1,
        'reg': 1,
        'title': '[2] (dr. Veselý) Experimentální protokol pro distribuování úlohy lámání hesel',
        'update': '2019-02-15T08:00:48'
      },
      {
        'id': 72556,
        'show': 1,
        'limit': 8,
        'reg': 2,
        'title': '[3] (Ing. Pluskal) Individuální zadání - IoT',
        'update': '2019-02-15T08:00:48'
      },
      {
        'id': 72737,
        'show': 1,
        'limit': 5,
        'reg': 3,
        'title': '[3] (Ing. Pluskal) [Tým 1-3 stud.] Vytvoření IoT senzoru (déšť, pohyb, teplota) -- LoRa',
        'update': '2019-02-15T10:40:16'
      },
      {
        'id': 72738,
        'show': 1,
        'limit': 2,
        'reg': 2,
        'title': '[3] (Ing. Pluskal) [Tým 1-2 stud.] Vytvoření IoT senzoru (déšť, pohyb, teplota) -- WiFi',
        'update': '2019-02-15T09:57:23'
      },
      {
        'id': 72739,
        'show': 1,
        'limit': 2,
        'reg': 2,
        'title': '[3] (Ing. Pluskal) [Tým 1-2 stud.] Senzor CO2, teploty, vlhkosti, osvětlení pro kancelář.',
        'update': '2019-02-18T12:50:18'
      },
      {
        'id': 72740,
        'show': 1,
        'limit': 5,
        'reg': 0,
        'title': '[3] (Ing. Pluskal) [Tým 1-5 stud.] Integrace mesh síťě s gateway do MQTT pomocí ESPNow do Esphomelib',
        'update': '2019-02-15T08:00:48'
      },
      {
        'id': 72741,
        'show': 1,
        'limit': 5,
        'reg': 0,
        'title': '[3] (Ing. Pluskal) [Tým 1-5 stud.] Integrace mesh síťě s gateway do MQTT pomocí Bluetooth do Esphomelib',
        'update': '2019-02-15T08:00:48'
      },
      {
        'id': 72742,
        'show': 1,
        'limit': 2,
        'reg': 0,
        'title': '[3] (Ing. Pluskal) [Tým 1-2 stud.] Vysoká dostupnost nástroje Home Assistant',
        'update': '2019-02-15T08:00:48'
      },
      {
        'id': 72743,
        'show': 1,
        'limit': 6,
        'reg': 0,
        'title': '[4] (Ing. Letavay) [Tým 1-2 stud.] Testování spolehlivosti Relay boardů',
        'update': '2019-02-15T08:00:48'
      },
      {
        'id': 73025,
        'show': 1,
        'limit': 1,
        'reg': 1,
        'title': '[5] (dr. Žádník) Vývoj modulu ovladače pro vysokorychlostní síťový adaptér',
        'update': '2019-02-15T08:00:48'
      },
      {
        'id': 73044,
        'show': 1,
        'limit': 3,
        'reg': 1,
        'title': '[3] (Ing. Pluskal) [Tým 1-2 stud.] Aplikace zpracovávající data z RFID karet',
        'update': '2019-02-15T08:00:48'
      },
      {
        'id': 73121,
        'show': 1,
        'limit': 1,
        'reg': 1,
        'title': '[5] (dr. Žádník) Aplikace záchytu síťového provozu využívající jazyka P4',
        'update': '2019-02-15T08:00:48'
      },
      {
        'id': 73162,
        'show': 1,
        'limit': 2,
        'reg': 0,
        'title': '[6] (dr. Grégr) NAT pomocí nftables',
        'update': '2019-02-18T18:24:48'
      },
      {
        'id': 73163,
        'show': 0,
        'limit': 2,
        'reg': 0,
        'title': '[6] (dr. Grégr) NAT modul pro iptables využívající hash table',
        'update': '2019-02-18T18:24:39'
      },
      {
        'id': 73164,
        'show': 0,
        'limit': 1,
        'reg': 0,
        'title': '[6] (dr. Grégr) Konfigurace VXLAN na systému Linux',
        'update': '2019-02-18T18:28:41'
      },
      {
        'id': 73165,
        'show': 0,
        'limit': 1,
        'reg': 0,
        'title': '[6] (dr. Grégr) Rozšíření směrovacího démona BIRD o push notifikace',
        'update': '2019-02-18T18:32:10'
      },
      {
        'id': 73170,
        'show': 1,
        'limit': 5,
        'reg': 0,
        'title': '[3] (Ing. Pluskal) [Tým 1-3 stud.] Vytvoření prototypu IoT senzoru (déšť, pohyb, teplota) -- LoRa',
        'update': '2019-02-19T10:37:45'
      }
    ]
  };

  res.json(json);
});

app.get('/FIT/db/vyuka/rest/course/:course/item/:variant', (req, res) => {
  if (req.params.course !== '12876' || req.params.variant !== '73044') {
    res.json({});
    return;
  }

  const json = {
    'status': 'OK',
    'count': 1,
    'data': {
      'id': 73044,
      'class': 'variant',
      'main_id': 72485,
      'entry': 'all',
      'show': 1,
      'limit': 3,
      'reg': 0,
      'title': '[3] (Ing. Pluskal) [Tým 1-2 stud.] Aplikace zpracovávající data z RFID karet',
      'update': '2019-02-15T08:00:48'
    },
    'links': {
      'students': '/FIT/db/vyuka/rest/course/12876/item/73044/students',
      'variants': '/FIT/db/vyuka/rest/course/12876/item/73044/variants'
    }
  };

  res.json(json);
});

app.get('/FIT/db/vyuka/rest/course/:course/item/:variant/students', (req, res) => {
  if (req.params.course !== '12876' || req.params.variant !== '73044') {
    res.json({});
    return;
  }

  const json = {
    'status': 'OK',
    'count': 1,
    'data': [
      {
        'id': 1957927,
        'person_id': 35748,
        'name': 'Voda Zbyšek, Bc.',
        'email': 'xvodaz01@stud.fit.vutbr.cz',
        'points': 3,
        'date': '0000-00-00',
        'who': '',
        'reg_type': 'zam',
        'reg_time': '2019-02-18T09:29:44',
        'update': '2019-02-19T10:47:31'
      },
      {
        'id': 1957928,
        'person_id': 35749,
        'name': 'Karel Mocklý, Bc.',
        'email': 'xmockl01@stud.fit.vutbr.cz',
        'points': 0,
        'date': '0000-00-00',
        'who': '',
        'reg_type': 'zam',
        'reg_time': '2019-02-18T09:29:44',
        'update': '2019-02-19T10:47:31'
      }
    ]
  };

  res.json(json);
});

app.get('/FIT/dns/getid', (req, res) => {
  const id = req.query.hex;

  if (id === 'CC4006CD') {
    res.send('xvodaz01;Zbyšek Voda;stud;FIT VUT');
  } else if (id === 'AABBAABB') {
    res.send('xmockl01;Karel Mocklý;stud;FIT VUT');
  } else {
    res.send('NOT_FOUND');
  }
});

/*
const rpcServer = xmlrpc.createServer({
  host: config.rpc.root,
  port: config.rpc.port
});

rpcServer.on('courses.set_item_points', (err, params, callback) => {
  const error = null;
  const result = 'OK';

  callback(error, result);
});
*/

// http.createServer(app).listen(2000);
https.createServer(config.https, app)
  .listen(2001);
