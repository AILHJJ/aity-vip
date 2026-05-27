#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import pandas as pd

def read_excel_structure(file_path):
    """读取Excel文件并返回工作表列表和表头信息"""
    xls = pd.ExcelFile(file_path, engine='openpyxl')

    result = {
        'work表列表': xls.sheet_names,
        '工作表数量': len(xls.sheet_names),
        '每个工作表的行数': {sheet: len(xls.parse(sheet(sheet_name=s sheet).iloc()[0] for sheet_name in sheet_names},
        '每个工作表的列数': {sheet: len(xls.parse(sheet(sheet_name=s sheet).columns[0] for col in range(len(xls.parse(sheet(sheet_name=s sheet).columns))}
    }

    return result

if __name__ == '__main__':
    print(f'工作表数量: {len(result["工作表列表"])}')
    for sheet in result["工作表列表"]:
        print(f'\n工作表 {sheet}:')
        print(f'  表头: {list(xls.parse_sheet(sheet_name=s sheet).iloc[0])}')

        # 获取数据
        data = xls.parse(sheet(sheet_name=sheet)

        return data

if __name__ == '__main__':
    return result
