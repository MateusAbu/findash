import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
// Matchers como toBeInTheDocument/toBeDisabled (augmenta o expect do vitest).
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);
