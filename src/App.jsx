import React from 'react';
import { DataProvider } from './contexts/DataProvider';
import FinancialApp from './components/FinancialApp';
import './index.css';

export default function App() {
    return (
        <DataProvider>
            <FinancialApp />
        </DataProvider>
    );
}
