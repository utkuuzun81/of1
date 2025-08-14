import React, { useState } from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import content from '../../../content/home.tr.json';

export default function FAQ(){
  const [open, setOpen] = useState(null);
  return (
    <Box sx={{ py:6, background:'#fafafa' }}>
      <Container>
        <Typography variant="h5" fontWeight={800} sx={{ mb:2 }}>Sık Sorulan Sorular</Typography>
        {content.faq.map((f, i)=> (
          <Accordion key={f.q} expanded={open===i} onChange={()=> setOpen(open===i? null : i)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`faq-${i}-content`} id={`faq-${i}-header`}>
              <Typography fontWeight={600}>{f.q}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{f.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}
