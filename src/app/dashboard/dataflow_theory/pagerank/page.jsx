"use client";
import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { paths } from '@/paths';

export default function PageRankTheory() {
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const images = ['/dataflow/pr1.png', '/dataflow/pr2.png'];
  const titles = ['PageRank数据流图 - 基本结构', 'PageRank数据流图 - 优化结构'];

  const handleNext = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageClick = () => {
    handleNext();
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f6fa' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                {titles[currentImage]}
              </Typography>
              <Box>
                <IconButton onClick={handlePrev} color="primary">
                  <ArrowBackIcon />
                </IconButton>
                <IconButton onClick={handleNext} color="primary">
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ 
              position: 'relative', 
              width: '100%', 
              height: '500px',
              display: 'flex',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <Box
                key={0}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: currentImage === 0 ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 1
                    }
                  }
                }}
                onClick={handleImageClick}
              >
                <Image
                  src={images[0]}
                  alt={`PageRank数据流图 1`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  width={800}
                  height={500}
                />
              </Box>
              <Box
                key={1}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: currentImage === 1 ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 1
                    }
                  }
                }}
                onClick={handleImageClick}
              >
                <Image
                  src={images[1]}
                  alt={`PageRank数据流图 2`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  width={800}
                  height={500}
                />
              </Box>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 2 
            }}>
              <Box
                onClick={() => setCurrentImage(0)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: currentImage === 0 ? 'primary.main' : 'grey.400',
                  mx: 0.5,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
              />
              <Box
                onClick={() => setCurrentImage(1)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: currentImage === 1 ? 'primary.main' : 'grey.400',
                  mx: 0.5,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 