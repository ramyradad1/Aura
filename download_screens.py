import os

screens = [
    {
        "name": "1_admin_analytics",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0ugz3-0yqinENiolpf-5n4n2Bpsd9IIO76pVdo18nywsJ9U0bhCISsbDsmjqeTePGV7Gv9DVoQd9G3u3tb7-VNT5tK9LEoXkHtnoOd_TIU1_Li0kqK_T_lEIhNhQaq3bXiY9-0fQouYNsMXpyjPgkOmQ6t7EnGgIw2F4hY6AeEgMV4QO3rJgRWnjqDTgjE_FmiicNPAkJsrL0PiN0TdZwJklV6dw0FwChVzBCXvdGPrvXgVd2p8z1AYzgHU",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2U5NmRjMGZiOTRmYTQwMzU5OTQ2YTJkZTU5N2I5N2Q5EgsSBxCl-u3ghgIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcwNDM5NjUzMjg0NDYxNDk2OA&filename=&opi=89354086"
    },
    {
        "name": "2_home_page",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uhYXi9VN5mU_oGXTRY5D8mYsg45c3gr1TG6N4CYCdvwBlFj-Zm_ZjNBwoEFK88W3hOITac4MoByBXkOzsS9FLuH0HI8GNMv0heldWgW_XzN2abaQJmsr7N3E7pNzg5C4SXGTW2BsMNhZRJ2FeanL_x_4BJxxBL1R-nbltNvGFsi3RGklCDfxjPYJfDjILREnT9H-04-m3SbNfkxwkp5sDcnU2Vg_Yn18_wk51jd2TONwiAvQ8BdRq2BEDiF",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzE4NzI4ZTdlOWNlOTQxMWRhOTY2ZTIzZGFmODg0ZWJlEgsSBxCl-u3ghgIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcwNDM5NjUzMjg0NDYxNDk2OA&filename=&opi=89354086"
    },
    {
        "name": "3_shopping_bag",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0ujK8EQm6VpzVmRHfKkBFXeOeKeTcfkQNjSAKUXaK4NoPaTIQCoYWFnfdxzRk-oa7-3PQNg3JW8GVYCD6aTgiZTwkSowGk9mEpiC1w8icGJk-GP7X2AL2RkV00wL58os2-FYYBkbRfNo6ua2f-irct6sxKOfRKhazE5XiRRlj8NPK_6EGAkDDQvoesedTgd5ApRLcutVcmYmd9BbcWlwMvVFwOBmfVIVr1ebT2oYaARFVbLnV1MgCkzdE7Sh",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2M3ZmEzNTBiMTU0YTQwNjViMDI0NGE1ZWE1ZmZkMWRhEgsSBxCl-u3ghgIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcwNDM5NjUzMjg0NDYxNDk2OA&filename=&opi=89354086"
    },
    {
        "name": "4_smart_assistant",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uiZ-PynAGEjp-WwV6MHvqUsX5aSNhlYGNsAH5c_7sGZv31V0_DNwY4tnSU3GH8W4AZKkuTcGb7i6Pwrro-LfjXDd1CTtbXRzVhN3KpllUalWLG-To6uZMzY5DyEQ2AcFbw_qWNguolHEmhNT17arkGxpFwrrdRPj03AmkjMs7ajaol9b6klXQv05vKk595lndHCooFk4PfSXTn_q2sw9kluPjXHzjGbWXIL7bY7pi-Kvkvh8d_JdUg7Sfk2",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2ZlYzA3YmQzMDVjMDQ1YjdhM2E3MjhmNmYzYWU4YWVhEgsSBxCl-u3ghgIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcwNDM5NjUzMjg0NDYxNDk2OA&filename=&opi=89354086"
    },
    {
        "name": "5_fragrance_detail",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0ugVUVxPoOi_aU9r3wW8KO4bPvrYXLzbe7-pUlN4FGjYoMkoXUX6Lq-fO89og-s8PZGVgY6MV1SXPoRLPSK5LT1jkC2vEwWUvj7fYcXBqQrxzswwpbViwNrudpkPTDlYQd1Z_0lk7w_b0NhrjDZwgVHLPxmhNdeZW83qXR25QmmptFB0hNIjAxshoiVHjOLUsgty5d1rSrxIQzumHKAxZqxhKcSU_bIUMy8p0eAYNt_VotmYyO31JFAH-aM7",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzU5ZGRhNTI2ZTFhZDQzOThhOTk0NDBlNmE0YTU5ZDJmEgsSBxCl-u3ghgIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcwNDM5NjUzMjg0NDYxNDk2OA&filename=&opi=89354086"
    },
    {
        "name": "6_scent_collection",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uhnpt1G8ei0o__qIBlkmqqQuoE9asNGTN7RJBcIzJ0y5Pvps5e1Cy2dyJ6jF03E_eqrq_WJLiKde_KNAvFD6peW_f9TE_oRTp-FnfjAmrq5zmqojuqtnRZNX8oV_CjYFRx0m1eyz2IEvHmEj5HsZMBObL8MHoGkeEGRQWbJ2fNDqTCBQTSegKNv3YdIMD_1mGq3AqpVnQL670pY6UlJiK0dOJ91pGG6XOplCjx7tbO_Br32DY9vJNxBXfoS",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzBmNjIyOTM5MTE1NTRjYjNiMjE5ZWUwNDZjZDI0MWM4EgsSBxCl-u3ghgIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcwNDM5NjUzMjg0NDYxNDk2OA&filename=&opi=89354086"
    },
    {
        "name": "7_checkout_page",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uiDQPgZpNtrskYPt_riVe378QqMF-QPvOB9V0OPGm_6T6l9g1ykQrsdqOeJ7R-ykMK8rm_6kUUWZ8-9eo4yO-fZcJfDFD8vcaePkPZxcuPAU5GrfZoOyKEYWWcqlzgRLSd3SBx5nTXpWllW2Y3pIN7vP0lJm4ldr2gqVEcKLcu7y64U3geJT5pQukyOnRPqXjxZZTudK3fNGQPtWJtWJPE9w493KsxwXdKijDWj1qxWD8AP_yhGJbElhQN_",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzdmZDMxYWJkYTljNTRiZTI4NDA4M2ZmNWExZmZiNmFlEgsSBxCl-u3ghgIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcwNDM5NjUzMjg0NDYxNDk2OA&filename=&opi=89354086"
    }
]

os.makedirs('stitch_screens', exist_ok=True)

for screen in screens:
    img_cmd = f'curl -L "{screen["img"]}" -o "stitch_screens/{screen["name"]}.png"'
    html_cmd = f'curl -L "{screen["html"]}" -o "stitch_screens/{screen["name"]}.html"'
    print(f"Downloading {screen['name']} image...")
    os.system(img_cmd)
    print(f"Downloading {screen['name']} html...")
    os.system(html_cmd)

print("All screens downloaded successfully.")
