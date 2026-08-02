import React from 'react';
import TableClientView from './TableClientView';

export function generateStaticParams() {
  const tableIds = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','V1','V2','V3'];
  return tableIds.map(tableId => ({ tableId }));
}

export default function TablePage({ params }: { params: { tableId: string } }) {
  const rawTableId = (params?.tableId || 'T1').toUpperCase();
  const tableId = rawTableId.startsWith('TABLE-') ? rawTableId.replace('TABLE-', '') : rawTableId;

  return <TableClientView tableId={tableId} />;
}
