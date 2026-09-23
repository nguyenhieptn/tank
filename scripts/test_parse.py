import gzip
import re
import json

sql_path = '/backups/siquantank_20260916/db/db_siquantangthietgiap_20260916.sql.gz'

def parse_sql_values(val_str):
    """Parses MySQL INSERT values string into a list of tuples/lists."""
    rows = []
    i = 0
    n = len(val_str)
    
    while i < n:
        while i < n and val_str[i] != '(':
            i += 1
        if i >= n:
            break
        i += 1 # skip '('
        
        current_row = []
        val = []
        in_string = False
        quote_char = None
        escape = False
        
        while i < n:
            c = val_str[i]
            if escape:
                if c == 'n':
                    val.append('\n')
                elif c == 'r':
                    val.append('\r')
                elif c == 't':
                    val.append('\t')
                elif c == '\\':
                    val.append('\\')
                elif c == '\'':
                    val.append('\'')
                elif c == '"':
                    val.append('"')
                elif c == '0':
                    val.append('\0')
                else:
                    val.append(c)
                escape = False
                i += 1
                continue
                
            if in_string:
                if c == '\\':
                    escape = True
                elif c == quote_char:
                    # Check for double quote escaping '' in SQL
                    if i + 1 < n and val_str[i+1] == quote_char:
                        val.append(quote_char)
                        i += 1
                    else:
                        in_string = False
                else:
                    val.append(c)
                i += 1
                continue
                
            # Not in string
            if c in ("'", '"'):
                in_string = True
                quote_char = c
                i += 1
            elif c == ',':
                raw = "".join(val).strip()
                if raw == 'NULL':
                    current_row.append(None)
                else:
                    current_row.append(raw)
                val = []
                i += 1
            elif c == ')':
                raw = "".join(val).strip()
                if raw == 'NULL':
                    current_row.append(None)
                else:
                    current_row.append(raw)
                val = []
                rows.append(current_row)
                i += 1
                break
            else:
                val.append(c)
                i += 1
    return rows

posts = []
terms = []
taxonomies = []
term_relationships = []
postmeta = []

with gzip.open(sql_path, 'rt', encoding='utf-8', errors='ignore') as f:
    for line in f:
        if line.startswith('INSERT INTO `wp_posts`'):
            val_part = line[line.find('VALUES')+6:].rstrip(';\n')
            parsed = parse_sql_values(val_part)
            posts.extend(parsed)
        elif line.startswith('INSERT INTO `wp_terms`'):
            val_part = line[line.find('VALUES')+6:].rstrip(';\n')
            terms.extend(parse_sql_values(val_part))
        elif line.startswith('INSERT INTO `wp_term_taxonomy`'):
            val_part = line[line.find('VALUES')+6:].rstrip(';\n')
            taxonomies.extend(parse_sql_values(val_part))
        elif line.startswith('INSERT INTO `wp_term_relationships`'):
            val_part = line[line.find('VALUES')+6:].rstrip(';\n')
            term_relationships.extend(parse_sql_values(val_part))

print(f"Loaded: posts={len(posts)}, terms={len(terms)}, taxonomies={len(taxonomies)}, rels={len(term_relationships)}")

# Let's inspect post types
post_types = {}
for p in posts:
    # post_type is index 20
    pt = p[20]
    post_types[pt] = post_types.get(pt, 0) + 1
print("Post types:", post_types)

# Let's inspect published posts
published = [p for p in posts if p[7] == 'publish' and p[20] == 'post']
print(f"Published standard posts: {len(published)}")

# Sample 5 published posts
for p in published[:5]:
    print("ID:", p[0], "| Title:", p[5], "| Date:", p[2])
