export const formatTRY = (n=0) => new Intl.NumberFormat('tr-TR',{ style:'currency', currency:'TRY' }).format(n);
