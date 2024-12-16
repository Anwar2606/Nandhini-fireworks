// InvoicePDF.js
import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
});

const InvoicePDF = ({ customerName, products, total }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text>Invoice</Text>
        <Text>Customer: {customerName}</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Product</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Quantity</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Price</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Total</Text>
            </View>
          </View>
          {products.map((product, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{product.name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{product.quantity}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>${product.price.toFixed(2)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>${(product.price * product.quantity).toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
        <Text>Total: ${total.toFixed(2)}</Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;
