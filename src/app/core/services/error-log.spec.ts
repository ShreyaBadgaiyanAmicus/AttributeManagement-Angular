import { TestBed } from '@angular/core/testing';
import { ErrorLog } from './error-log';

describe('ErrorLog', () => {
  let service: ErrorLog;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorLog);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
