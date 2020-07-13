import pdfplumber
import pandas as pd

pdf=pdfplumber.open('1 _March 30-31st.pdf')
pages=pdf.pages
for p in pages:
    raw_table = p.extract_table()
