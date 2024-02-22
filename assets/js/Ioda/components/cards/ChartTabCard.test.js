import '@testing-library/dom'
import '@testing-library/jest-dom/extend-expect';
import React from 'react'
import { render, act, screen } from '@testing-library/react'
import ChartTabCard from './ChartTabCard'
import { HashRouter } from "react-router-dom";

jest.mock('./ChartLegendCard', () => () => <div>ChartLegendCard</div>)
const ChartTabCardWrapper = () => <HashRouter><ChartTabCard /></HashRouter>

describe('ChartTabChart', () => {
  it('is fine', async () => {
   render(<ChartTabCardWrapper />)

    expect(screen.getByText('ChartLegendCard')).toBeInTheDocument()
  })
})
