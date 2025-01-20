import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '../app/page'

test('Ensure the Home Page has Firstfruit Real Estate', () => {
  render(<Page />)
  expect(screen.getByRole('h1', { name: 'Firstfruit' })).toBeDefined()
})