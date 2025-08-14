import React from 'react';
import { Box, Container, Grid, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import useInView from '../../../hooks/useInView';
import IconClay from '../../../components/ui/IconClay';
import { useNavigate } from 'react-router-dom';
import content from '../../../content/home.tr.json';

export default function Advantages(){
  const nav = useNavigate();
  const [ref, inView] = useInView({ threshold: 0.2 });
  return (
    <Box ref={ref} sx={{ py:6, background:'#f7f9fb' }}>
      <Container>
        <Grid container spacing={2}>
          {content.advantages.map((a, i)=> (
            <Grid item xs={12} md={3} key={a.title}
              sx={{
                transform: inView ? 'none' : 'translateY(16px)',
                opacity: inView ? 1 : 0,
                transition: `all .6s ${i * 90}ms cubic-bezier(.2,.8,.2,1)`
              }}
            >
              <Card elevation={0} sx={{ height:'100%', borderRadius:3, background:'#fff',
                boxShadow:'0 8px 20px rgba(2,8,23,0.06)', border:'1px solid #eef2f7',
                '&:hover':{ boxShadow:'0 12px 28px rgba(2,8,23,0.08)', transform:'translateY(-2px)', transition:'all .2s' }
              }}>
                <CardActionArea onClick={()=> nav(a.href)} sx={{ height:'100%' }}>
                  <CardContent>
                    <Box sx={{ display:'grid', placeItems:'start', mb:1 }}>
                      <IconClay variant={iconFor(a.title)} size={56} />
                    </Box>
                    <Typography variant="h6" fontWeight={800}>{a.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{a.desc}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function iconFor(title){
  const t = title.toLowerCase();
  if(t.includes('hızlı')||t.includes('teklif')) return 'bolt';
  if(t.includes('sadakat')) return 'star';
  if(t.includes('fiyat')) return 'erp';
  if(t.includes('güven')) return 'shield';
  return 'star';
}
