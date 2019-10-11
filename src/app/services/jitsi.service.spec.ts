import { TestBed } from '@angular/core/testing';

import { JitsiService } from './jitsi.service';

describe('JitsiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JitsiService = TestBed.get(JitsiService);
    expect(service).toBeTruthy();
  });
});
