// https://grafana.com/docs/k6

import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '1s',
};

export default function() {
  http.get('http://teachyourselfmath.app/api/v1/problems');
  sleep(1);
}
