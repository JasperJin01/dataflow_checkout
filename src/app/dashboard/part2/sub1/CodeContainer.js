import React from 'react';
import { styled } from '@mui/material/styles';

const CodeContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.grey[100],
  borderRadius: '4px',
  border: `1px solid ${theme.palette.divider}`,
  fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
  fontSize: '0.875rem',
  lineHeight: 1.5,
  overflow: 'auto',
  padding: '16px',
  whiteSpace: 'pre',        // 严格保留原始换行符
  overflowX: 'auto',        // 启用横向滚动
  lineBreak: 'auto',        // 智能处理换行点
  hyphens: 'none',          // 禁止连字符换行
  wordWrap: 'normal',       // 保持原生换行行为
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.shadows[1]
  },
  '&::selection': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white
  }
}));

const ReadOnlyCodeBox = ({
  content,
  height = 300,
  showLineNumbers = false
}) => {
  const handleKeyDown = (e) => {
    // 阻止键盘编辑操作
    if (!(e.ctrlKey || e.metaKey) && e.key.length === 1) {
      e.preventDefault();
    }
  };

  return (
    <CodeContainer
      style={{ height: `${height}px` }}
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => e.preventDefault()}
      tabIndex="0"
    >
      {showLineNumbers && (
        <div style={{
          position: 'absolute',
          left: 0,
          paddingRight: '8px',
          userSelect: 'none'
        }}>
          {content.split('\n').map((_, i) => (
            <span key={i}>{i + 1}<br /></span>
          ))}
        </div>
      )}
      <code style={{
        display: 'block',
        marginLeft: showLineNumbers ? '24px' : 0,
      }}>
        {content}
      </code>
    </CodeContainer>
  );
};

export default ReadOnlyCodeBox;
